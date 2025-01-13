import {Event} from '../../models/events';
import {Service} from '../../providers/service/service';
import {ObjectUtil} from '../utils';
import {EventObserver} from '../../models/events/event-observer';

/**
 * A service that manages event subscriptions and emissions.
 *
 * Allows components or modules to subscribe to specific events and be notified when those events are emitted.
 */
export class EventService implements Service {

  /**
   * A map of event names to their corresponding list of subscribers.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventSubscribers: Map<string, EventObserver<any>[]> = new Map<string, EventObserver<any>[]>();

  /**
   * Emits an event to all subscribers of the specified event type.
   *
   * @template T - The type of the event payload.
   * @param event - The event to emit, containing its name and payload.
   */
  emit<T extends {} | undefined>(event: Event<T>): void {
    const subscribers = this.eventSubscribers.get(event.NAME);
    if (subscribers) {
      subscribers.forEach((subscriber) => {
        subscriber.notify(ObjectUtil.deepCopy(event.payload));
      });
    }
  }

  /**
   * Subscribes to a specific event with a callback function.
   *
   * @template T - The type of the event payload.
   * @param eventName - The name of the event to subscribe to.
   * @param callback - A callback function to handle the event notifications.
   *
   * @returns A function to unsubscribe from the event.
   */
  subscribe<T extends {} | undefined>(eventName: string, callback: (payload: T) => void): () => void {
    const observer = new EventObserver<T>(callback);
    const eventSubscribers = this.eventSubscribers.get(eventName);

    if (eventSubscribers) {
      eventSubscribers.push(observer);
    } else {
      this.eventSubscribers.set(eventName, [observer]);
    }
    return () => this.unsubscribe(eventName, observer);
  }

  /**
   * Unsubscribes an observer from a specific event type.
   *
   * @template T - The type of the event payload.
   * @param eventName - The name of the event to unsubscribe from.
   * @param observer - The observer to remove from the subscribers list.
   *
   * @private
   */
  private unsubscribe<T extends {} | undefined>(eventName: string, observer: EventObserver<T>): void {
    const eventSubscribers = this.eventSubscribers.get(eventName);
    if (eventSubscribers) {
      const index = eventSubscribers.indexOf(observer);
      if (index !== -1) {
        eventSubscribers.splice(index, 1);
      }
      if (eventSubscribers.length === 0) {
        this.eventSubscribers.delete(eventName);
      }
    }
  }
}
