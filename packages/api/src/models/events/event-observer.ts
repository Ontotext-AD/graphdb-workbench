import { EventSubscriptionCancelHandler } from './event-subscription-cancel-handler';
import { EventSubscriptionCallback } from './event-subscription-callback';

/**
 * Represents an observer for events, encapsulating a callback to handle event notifications
 * and an optional handler that can prevent the event from being emitted.
 *
 * @template T - The type of the event payload.
 */
export class EventObserver<T> {

  /**
   * Callback invoked when the event is emitted.
   */
  notify: EventSubscriptionCallback<T>;

  /**
   * Handler evaluated before the event is emitted.
   *
   * If the handler resolves to <code>true</code>, the event emission is canceled.
   * If the handler resolves to <code>false</code>, the event emission is allowed to proceed.
   */
  shouldCancelEventHandler?: EventSubscriptionCancelHandler;

  /**
   * Creates a new event observer.
   *
   * @param callback - Callback invoked when the event is emitted.
   * @param shouldCancelEventHandler - Handler used to determine whether the event emission should be canceled.
   */
  constructor(callback: EventSubscriptionCallback<T>, shouldCancelEventHandler?: EventSubscriptionCancelHandler) {
    this.notify = callback;
    this.shouldCancelEventHandler = shouldCancelEventHandler;
  }
}
