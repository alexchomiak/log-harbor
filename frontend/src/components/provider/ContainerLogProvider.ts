import { LogProvider } from "./LogProvider";
import { getContainerWorker } from "./WorkerProvider";

export const internalFieldKey = "ui_internal_field_"

export function containerLogProvider(container: any): LogProvider {
    const worker = getContainerWorker()
    const host = import.meta.env.MODE == "development" ? "localhost:3000" : window.location.host
    worker.postMessage(JSON.stringify({ type: "subscribe",  container, host }))   
    return {
        type: "container", cleanup: () => {
            worker.postMessage(JSON.stringify({ type: "unsubscribe", container, host }))
        }
    }
}