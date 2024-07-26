import {Event} from '../models/events/event';
import {Service} from './service';

/**
 * Service used for global communication within the workbench ecosystem.
 */
export class EventService implements Service {
    private hostElement;
    constructor() {
        this.hostElement = document.querySelector('body');
    }

    emit(event: Event): CustomEvent {
        const customEvent = new CustomEvent(event.NAME, {detail: event.payload});
        this.hostElement.dispatchEvent(customEvent);
        return customEvent;
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
