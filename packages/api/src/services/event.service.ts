import {Event} from '../models/events/event';
import {Service} from './service';

/**
 * Service used for global communication within all modules. It allows emitting and subscribing to CustomEvents across
 * the application where the events are emitted via the <code>document.body</code> element. This allows for the events
 * to be caught by any component in any module.
 */
export class EventService implements Service {
    /**
     * Emits a {@link CustomEvent} of type passed <code>event.NAME</code> and detail <code>event.payload</code>.
     *
     * @param event - the event to be emitted.
     * @return the emitted event.
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
     * @return unsubscribe function which can be used for manual unsubscription.
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
        return document.body;
    }
}
