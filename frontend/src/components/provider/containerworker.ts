import localforage from "localforage";
import { internalFieldKey } from "./ContainerLogProvider";

const subscriptions: any = {}
const WINDOW_BUFFER_LIMIT = 16000
const dedupMap: any = {}

self.onmessage = function(e) {

    const data = e.data;
    const event = JSON.parse(data);
    console.log("Worker Event", event)
    if (event.type === 'subscribe') {
        const { container, host } = event;
        const containerId = container.Id;

        (async () => {
            const item: any = await localforage.getItem(container.Id)
            if (item == null) {
                console.log("Creating new local buffer")
                await localforage.setItem(container.Id, {
                    logbuf: []
                })
            } else {
                // * Populate dedup map
                const dbBuf: any = item.logbuf
                dbBuf.forEach((log: any) => {
                    const t = log[`${internalFieldKey}time`]
                    const d = log[`${internalFieldKey}log`]
                    const k = `${t}-${d}`
                    dedupMap[k] = true
                })
                self.postMessage(JSON.stringify({ type: "update", id: containerId, buffer: item.logbuf }))
            }
        })();
        


        const socketUrl = `ws://${host}/ws/logs/` + containerId;
        const connection = new WebSocket(socketUrl)

        
        let interval: any = null;

        connection.onopen = () => {
            // * KeepAlive pings
            interval = setInterval(() => {
                connection.send(JSON.stringify({ interval: 5 }));
            }, 1000)
            subscriptions[containerId].keepAliveInterval = interval
            connection.send(JSON.stringify({ interval: 5 }));
        }

        connection.onmessage = (m) => {
            subscriptions[containerId].messageBuffer.push(m)
        }


        const refresh = async () => {
            const messageBuffer = subscriptions[containerId].messageBuffer
            // console.log(messageBuffer.length)

            if(messageBuffer.length == 0) {
                return;
            }
    
            if(subscriptions[containerId].processing) {
                return
            }
            subscriptions[containerId].processing = true 
    
            const windowItem: any = await localforage.getItem(containerId)
            const messageBufCopy = [...messageBuffer]
            const newMessages: any[] = []
            messageBufCopy.forEach((m: any) => {
                const toks = m.data.split(" ")
                const timestamp = toks[0]
                const data = toks.slice(1).join(" ")
    
                let fields = {}
                try {
                    fields = JSON.parse(data)
                } catch (e) { }
    
                const logKey = `${internalFieldKey}log`
                const ingestionKey = `${internalFieldKey}ingestionTime`
                const containerFields: any = {
                    [`${internalFieldKey}logProvider`]: containerId,
                    [`${internalFieldKey}containerId`]: containerId,
                    [`${internalFieldKey}containerName`]: container.Name,
                    [`${internalFieldKey}containerColor`]: container.color,
                    [`${internalFieldKey}containerImage`]: container.Config.Image,
                    [`${internalFieldKey}time`]: timestamp,
                }
                newMessages.push({ [logKey]: data, [ingestionKey]: new Date(), ...containerFields, ...fields })
            })
    
            let windowBuf = []
            if (windowItem != null && windowItem.logbuf != undefined)  {
                windowBuf = windowItem.logbuf
            }
            // console.log("DB buffer", windowBuf)
            // console.log("New Messages", newMessages)
            let buf = [...windowBuf, ...newMessages.filter((log) => {
                const t = log[`${internalFieldKey}time`]
                const d = log[`${internalFieldKey}log`]
                const k = `${t}-${d}`
                if (dedupMap[k] == undefined) {
                    dedupMap[k] = true
                    return true
                }
                return false
            })];
    
            if (buf.length > WINDOW_BUFFER_LIMIT) {
                while (buf.length > WINDOW_BUFFER_LIMIT) {
                    buf.shift()
                }
            }
            await localforage.setItem(container.Id, {
                logbuf: buf
            })
    
            
            // Remove processed messages from open message buf
            const messageMap: any = {} 
            newMessages.forEach((msg) => {
                const t = msg[`${internalFieldKey}time`]
                const d = msg[`${internalFieldKey}log`]
                const k = `${t}-${d}`
                messageMap[k] = true
            })
            let removed = 0
            subscriptions[containerId].messageBuffer = messageBuffer.filter((m: any) => {
                const toks = m.data.split(" ")
                const timestamp = toks[0]
                const data = toks.slice(1).join(" ")
                const t = timestamp
                const d = data
                const k = `${t}-${d}`
                if(messageMap[k] != undefined) {
                    removed += 1
                }
                return messageMap[k] == undefined
            })
            // console.log("Done processing. Removed", removed, "messages from queue")
            self.postMessage(JSON.stringify({ type: "update", id: containerId, buffer: buf }))
            subscriptions[containerId].processing = false
    
        }

        const refreshInterval = setInterval(() => {
            refresh()
        }, 500)


        subscriptions[containerId] = {
            messageBuffer: [],
            connection: connection,
            refreshInterval,
            keepAliveInterval: interval,
            processing: false
        }
         
    }

    if(event.type == "unsubscribe") {
        const { container } = event;
        const containerId = container.Id
        const sub = subscriptions[containerId]
        
        if(sub != undefined) {
            clearInterval(sub.refreshInterval)
            clearInterval(sub.keepAliveInterval)
            if (sub.connection.readyState == WebSocket.OPEN || sub.connection.readyState == WebSocket.CONNECTING) {
                sub.connection.close()
            }
            // delete subscriptions[containerId]
            console.log("Unsubscribed", containerId)
        }
    }

    

}

// self.postMessage('Hello from worker')

// setInterval(() => {
//     console.log("Subscriptions", subscriptions)
// }, 1000);