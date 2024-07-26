import {Event} from '../models/events/event';
import {Service} from './service';

/**
 * Service used for global communication within all modules.
 */
export class EventService implements Service {

    /**
     * Emits a {@link CustomEvent} of type passed <code>event.NAME</code> and detail <code>event.payload</code>.
     *
     * @param event - the event to be emitted.
     */
    emit(event: Event): CustomEvent {
        const customEvent = new CustomEvent(event.NAME, {detail: event.payload});
        this.getHostElement().dispatchEvent(customEvent);
        return customEvent;
    }

    /**
     * Subscribes for event of type <code>eventName</code>.
     *
     * @param eventName - type of subscription event.
     * @param callback - callback function that will be called when the event occurred.
     *
     * @return unsubscribe function.
     */
    subscribe(eventName: string, callback: (payload: any) => void): () => void {
        const listener = (event) => {
            if (event instanceof CustomEvent) {
                callback(event.detail);
            }
        };
        this.getHostElement().addEventListener(eventName, listener);

        return () => this.getHostElement().removeEventListener(eventName, listener);
    }

    private getHostElement(): HTMLElement {
        return document.querySelector('div');
    }
}
