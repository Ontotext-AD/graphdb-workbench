import { Event } from '../models/events/event';
import {Emitter} from './emitter';

/**
 * Event emitter used for global communication within all modules. It allows emitting and subscribing to CustomEvents across
 * the application where the events are emitted via the <code>document.body</code> element. This allows for the events
 * to be caught by any component in any module.
 *
 * @template T - The type of the payload for the events.
 */
export class EventEmitter<T extends {} | undefined> implements Emitter {
  /**
   * Emits a {@link CustomEvent} of type <code>event.NAME</code> and detail <code>event.payload</code>.
   *
   * @param event - The event to be emitted.
   * @returns The emitted event.
   */
  emit(event: Event<T>): CustomEvent {
    const customEvent = new CustomEvent(event.NAME, { detail: event.payload });
    this.getHostElement().dispatchEvent(customEvent);
    return customEvent;
  }

  /**
   * Subscribes to an event of type <code>eventName</code>.
   *
   * @param eventName - The type of subscription event.
   * @param callback - The callback function that will be called when the event occurs.
   * @returns A function to unsubscribe from the event.
   */
  subscribe(eventName: string, callback: (payload: T) => void): () => void {
    const listener = (event: unknown) => {
      if (event instanceof CustomEvent) {
        callback(event.detail as T);
      }
    };
    this.getHostElement().addEventListener(eventName, listener);

    return () => this.getHostElement().removeEventListener(eventName, listener);
  }

  private getHostElement(): HTMLElement {
    return document.body;
  }
}
