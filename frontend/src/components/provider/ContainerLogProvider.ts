import { LogProvider } from "./LogProvider";


export const internalFieldKey = "ui_internal_field_"

interface ContainerLogProvider extends LogProvider {
    provider: WebSocket
}

export function containerLogProvider(container: any, setBuffer: (any: any) => void, bufferRef: any): ContainerLogProvider {

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
                    let fields = {}
                    try {
                        fields = JSON.parse(m.data)
                    } catch (e) { }

                    const logKey = `${internalFieldKey}log`
                    const ingestionKey = `${internalFieldKey}ingestionTime`
                    const containerFields: any = {
                        [`${internalFieldKey}logProvider`]: containerId,
                        [`${internalFieldKey}containerId`]: containerId,
                        [`${internalFieldKey}containerName`]: container.Name,
                        [`${internalFieldKey}containerColor`]: container.color,

                        [`${internalFieldKey}containerImage`]: container.Config.Image,
                    }
                    newMessages.push({ [logKey]: m.data, [ingestionKey]: new Date(), ...containerFields, ...fields })
                })
                const buf = [...ref.current, ...newMessages];
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
            console.log("ping")
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