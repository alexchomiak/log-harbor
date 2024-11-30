
import Worker from "./containerworker.ts?worker&inline";

export function getContainerWorker() {
    if(!window.containerWorker) {
        window.containerWorker = new Worker()
    }
    return window.containerWorker;
}