import { LogProvider } from "./LogProvider";


export const internalFieldKey = "ui_internal_field_"

interface ContainerLogProvider extends LogProvider {
    provider: WebSocket
}

const WINDOW_BUFFER_LIMIT = 5000



export function containerLogProvider(container: any, setBuffer: (any: any) => void, bufferRef: any): ContainerLogProvider {
    const dedupMap: any = {}
    setTimeout(() => {
    if(window.localStorage.getItem(container.Id) == null) {
        window.localStorage.setItem(container.Id, JSON.stringify({
            logbuf: []}
        ))
    } else {
        
        setBuffer(() => {
            console.log("Loading buffer from local storage")
            const buf = JSON.parse(window.localStorage.getItem(container.Id) as string).logbuf
            buf.forEach((log: any) => {
                const t = log[`${internalFieldKey}time`]
                const d = log[`${internalFieldKey}log`]
                const k = `${t}-${d}`
                dedupMap[k] = true
            })
            return [...buf]
        })
    }})
    const host = import.meta.env.MODE == "development" ? "localhost:3000" : window.location.host
    const containerId = container.Id
    const ref = bufferRef

    const socketUrl = `ws://${host}/ws/logs/` + containerId;

    const connection = new WebSocket(socketUrl)
    let messageBuffer: any[] = []
    connection.onmessage = (m) => {        
        messageBuffer.push(m)
    }
  

    const refresh = () => {
        
        if (messageBuffer.length > 0) {
            setBuffer(() => {
                const newMessages: any[] = []
                messageBuffer.forEach((m: any) => {
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
                const windowItem = window.localStorage.getItem(container.Id)
                if(windowItem != null) {
                    windowBuf = JSON.parse(windowItem as string).logbuf
                }
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
                window.localStorage.setItem(container.Id, JSON.stringify({
                    logbuf: buf}
                ))
                messageBuffer = []
                return buf
            });
            
        }
    }

    const messageInterval = window.setInterval(() => {
        refresh()
    }, 250)

    let interval: null | number = null;

    connection.onopen = () => {
        // * KeepAlive pings
        interval = window.setInterval(() => {
            connection.send(JSON.stringify({ interval: 5 }));
        }, 1000)
        connection.send(JSON.stringify({ interval: 5 }));

        setTimeout(refresh,50)
    }


    return {
        type: "container", provider: connection, cleanup: () => {
            console.log("Cleaning up")
            if (interval != null) {
                clearInterval(interval);
            }
            if (messageInterval != null) {
                clearInterval(messageInterval);
            }
            if (connection.readyState == WebSocket.OPEN || connection.readyState == WebSocket.CONNECTING) {
                connection.close()
            }
        }
    }
}