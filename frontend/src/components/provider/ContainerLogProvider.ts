import localforage from "localforage";
import { LogProvider } from "./LogProvider";
import { getContainerWorker } from "./WorkerProvider";

export const internalFieldKey = "ui_internal_field_"


const WINDOW_BUFFER_LIMIT = 2048


export function containerLogProvider(container: any, setBuffer: (any: any) => void, bufferRef: any): LogProvider {
    const dedupMap: any = {}

    let loadedLocal = false
    const host = import.meta.env.MODE == "development" ? "localhost:3000" : window.location.host
    const containerId = container.Id
    const worker: Worker = getContainerWorker()
    worker.postMessage(JSON.stringify({ type: "subscribe",  container, host }))

    worker.onmessage = (e) => {
        const data = e.data;
        const event = JSON.parse(data);
        if(event.type == "update") {
            const { buffer } = event
            setBuffer(() => [...buffer])
        }
    }
    
    return {
        type: "container", cleanup: () => {
            console.log("Cleaning up")
            worker.postMessage(JSON.stringify({ type: "unsubscribe", container, host }))
            // if (connection.readyState == WebSocket.OPEN || connection.readyState == WebSocket.CONNECTING) {
            //     connection.close()
            // }
        }
    }
}