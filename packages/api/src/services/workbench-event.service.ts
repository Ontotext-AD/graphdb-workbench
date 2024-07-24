import {WorkbenchEvent} from '../models/events/workbench.event';
import {WorkbenchService} from './workbenchService';

/**
 * Service used for global communication within the workbench ecosystem.
 */
export class WorkbenchEventService implements WorkbenchService {
    private hostElement;
    constructor() {
        this.hostElement = document.querySelector('body');
    }

    emit(workbenchEvent: WorkbenchEvent): CustomEvent {
        const event = new CustomEvent(workbenchEvent.NAME, {detail: workbenchEvent.payload});
        this.hostElement.dispatchEvent(event);
        return event;
    }
    subscribe(eventName: string, callback: (payload: any) => void): () => void {
        const listener = (event: Event) => {
            if (event instanceof CustomEvent) {
                callback(event.detail);
            }
        };

        this.hostElement.addEventListener(eventName, listener);

        // Return an unsubscribe function
        return () => {
            this.hostElement.removeEventListener(eventName, listener);
        };
    }
}
