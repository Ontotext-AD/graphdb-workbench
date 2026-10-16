import {Event} from '../../models/events';
import {Service} from '../../providers/service/service';
import {ObjectUtil} from '../utils';
import {EventObserver} from '../../models/events/event-observer';
import {EventSubscriptionCancelHandler} from '../../models/events/event-subscription-cancel-handler';
import {EventSubscriptionCallback} from '../../models/events/event-subscription-callback';
import {LoggerProvider} from '../logging/logger-provider';

/**
 * A service that manages event subscriptions and emissions.
 *
 * Allows components or modules to subscribe to specific events and be notified when those events are emitted.
 */
export class EventService implements Service {
  private readonly logger = LoggerProvider.logger;

  /**
   * A map of event names to their corresponding list of subscribers.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventSubscribers: Map<string, EventObserver<any>[]> = new Map<string, EventObserver<any>[]>();

  /**
   * Emits an event to all subscribers of the specified event type.
   *
   * Without cancellation handlers, the subscribers are notified synchronously. Otherwise, the handlers run first,
   * and the subscribers are notified asynchronously, only if no handler cancels the event. Only a handler can
   * affect the caller, e.g. the single-spa navigation that waits for the returned promise.
   *
   * @template T - The type of the event payload.
   * @param event - The event to emit, containing its name and payload.
   * @returns A promise that resolves to <code>true</code> if the event was canceled.
   */
  emit<T extends {} | undefined>(event: Event<T>): Promise<boolean> {
    const subscribers = this.eventSubscribers.get(event.NAME);
    if (!subscribers) {
      return Promise.resolve(false);
    }

    if (!subscribers.some((subscriber) => subscriber.cancellationHandler)) {
      this.notifySubscribers(subscribers, event);
      return Promise.resolve(false);
    }

    return this.shouldCancelEvent(subscribers, event)
      .then((cancelEvent) => {
        if (!cancelEvent) {
          this.notifySubscribers(subscribers, event);
        }
        return cancelEvent;
      });
  }

  private notifySubscribers<T extends {} | undefined>(subscribers: EventObserver<unknown>[], event: Event<T>): void {
    subscribers.forEach((subscriber) => {
      subscriber.notify(ObjectUtil.deepCopy(event.payload));
    });
  }

  /**
   * Evaluates the cancellation handlers of the provided observers.
   *
   * Cancellation handlers are evaluated sequentially until one of them requests cancellation.
   * If a handler requests cancellation, the remaining handlers are not evaluated.
   *
   * @template T - The type of the event payload.
   * @param observers - The observers whose cancellation handlers should be evaluated.
   * @param event - The event whose payload is passed to the cancellation handlers.
   * @returns A promise that resolves to <code>true</code> if the event is canceled, or <code>false</code> if no.
   */
  private async shouldCancelEvent<T extends {} | undefined>(observers: EventObserver<unknown>[], event: Event<T>): Promise<boolean> {
    for (const observer of observers) {
      try {
        if (await observer.cancellationHandler?.(event.payload)) {
          return true;
        }
      } catch (error) {
        this.logger.error(`The cancellation handler of the "${event.NAME}" event failed, the event is not canceled`, error);
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
   * @returns A function that unsubscribes the observer from the event.
   */
  subscribe<T extends {} | undefined>(eventName: string, callback: EventSubscriptionCallback<T>): () => void {
    return this.addObserver(eventName, new EventObserver<T>(callback));
  }

  /**
   * Registers a handler that can cancel the emission of an event.
   *
   * @template T - The type of the event payload.
   * @param eventName - The name of the event.
   * @param cancellationHandler - Resolves to <code>true</code> to cancel the emission, or <code>false</code> to let it proceed.
   * @returns A function that removes the handler.
   */
  addCancellationHandler<T extends {} | undefined>(eventName: string, cancellationHandler: EventSubscriptionCancelHandler<T>): () => void {
    return this.addObserver(eventName, new EventObserver<T>(() => undefined, cancellationHandler));
  }

  private addObserver<T extends {} | undefined>(eventName: string, observer: EventObserver<T>): () => void {
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
