import { LogProvider } from "./LogProvider";
import { getContainerWorker } from "./WorkerProvider";

export const internalFieldKey = "ui_internal_field_"

export function containerLogProvider(container: any, setBuffer: (any: any) => void, bufferRef: any): LogProvider {
    const host = import.meta.env.MODE == "development" ? "localhost:3000" : window.location.host
    const worker: Worker = getContainerWorker()
    worker.postMessage(JSON.stringify({ type: "subscribe",  container, host }))
    worker.onmessage = (e) => {
        const data = e.data;
        const event = JSON.parse(data);
        if(event.type == "update") {
            const { buffer } = event
            setBuffer(() => ({
                ...bufferRef.current,
                [container.Id]: buffer
            }))
        }
    }
    return {
        type: "container", cleanup: () => {
            worker.postMessage(JSON.stringify({ type: "unsubscribe", container, host }))
        }
    }
}