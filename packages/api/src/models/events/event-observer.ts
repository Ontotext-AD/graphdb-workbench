/**
 * Represents an observer for events, encapsulating a callback to handle event notifications.
 *
 * @template T - The type of the event payload.
 */
export class EventObserver<T> {

  /**
   * A callback function to notify the observer of an event.
   *
   * @param eventPayload - The payload of the event to notify the observer about.
   */
  notify: (eventPayload: T) => void;

  constructor(callback: (payload: T) => void) {
    this.notify = callback;
  }
}
