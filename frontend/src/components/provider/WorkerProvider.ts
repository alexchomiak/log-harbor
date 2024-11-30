
import Worker from "./containerworker.ts?worker&inline";

export function getContainerWorker() {
    // @ts-expect-error global variable
    if(!window.containerWorker) {
        // @ts-expect-error global variable
        window.containerWorker = new Worker()
    }
        // @ts-expect-error global variable
    return window.containerWorker;
}