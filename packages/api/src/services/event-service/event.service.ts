import {Event} from '../../models/events';
import {Service} from '../../providers/service/service';
import {ObjectUtil} from '../utils';
import {EventObserver} from '../../models/events/event-observer';
import {EventSubscriptionCancelHandler} from '../../models/events/event-subscription-cancel-handler';
import {EventSubscriptionCallback} from '../../models/events/event-subscription-callback';

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
   * Before notifying subscribers, registered cancellation handlers are evaluated.
   * If any handler requests cancellation, the event is not emitted.
   *
   * @template T - The type of the event payload.
   * @param event - The event to emit, containing its name and payload.
   */
  emit<T extends {} | undefined>(event: Event<T>): void {
    const subscribers = this.eventSubscribers.get(event.NAME);
    if (!subscribers) {
      return;
    }

    this.shouldCancelEvent(subscribers)
      .then((cancelEvent) => {
        if (!cancelEvent) {
          subscribers.forEach((subscriber) => {
            subscriber.notify(ObjectUtil.deepCopy(event.payload));
          });
        }
      });
  }

  /**
   * Evaluates cancellation handlers for the provided observers.
   *
   * Handlers are evaluated sequentially until one of them requests cancellation of the event.
   *
   * @param observers - The observers whose cancellation handlers should be evaluated.
   *
   * @returns A promise that resolves to <code>true</code> if the event should be canceled,
   * or <code>false</code> if no handler requests cancellation.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async shouldCancelEvent(observers: EventObserver<any>[]): Promise<boolean> {
    for (const observer of observers) {
      const shouldCancel = await observer.shouldCancelEventHandler?.();
      if (shouldCancel) {
        return true;
      }
    }
    return false;
  }

  /**
   * Subscribes to a specific event with a callback function.
   *
   * @template T - The type of the event payload.
   * @param eventName - The name of the event to subscribe to.
   * @param callback - A callback function invoked when the event is emitted.
   * @param shouldCancelEventHandler - Optional handler that resolves to <code>true</code> when the event emission should be canceled,
   * or <code>false</code> when it should proceed.
   *
   * @returns A function that unsubscribes the observer from the event.
   */
  subscribe<T extends {} | undefined>(eventName: string, callback: EventSubscriptionCallback<T>, shouldCancelEventHandler?: EventSubscriptionCancelHandler): () => void {
    const observer = new EventObserver<T>(callback, shouldCancelEventHandler);
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
