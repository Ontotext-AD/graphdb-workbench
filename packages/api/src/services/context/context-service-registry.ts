import type { ContextService } from './context.service';
import {Service} from '../../providers/service/service';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {BeforeChangeValidationPromise} from '../../models/context/before-change-validation-promise';

/**
 * Describes a global subscription to value changes in any registered ContextService.
 * This is used to apply the same callback logic to all context-managed properties across services.
 */
type GlobalSubscription = {
  callback: ValueChangeCallback<unknown>;
  beforeChangeValidationPromise?: BeforeChangeValidationPromise<unknown>;
  afterChangeCallback?: ValueChangeCallback<unknown>;
};

/**
 * ContextServiceRegistry is responsible for tracking all registered ContextService instances in the application.
 * It supports global subscription to context changes and notifies newly registered services of existing global listeners.
 */
export class ContextServiceRegistry implements Service {
  private readonly services: ContextService<Record<string, unknown>>[] = [];
  private readonly subscribers: GlobalSubscription[] = [];

  registerContextService(service: ContextService<Record<string, unknown>>): void {
    this.services.push(service);

    // Apply all global subscribers to the newly registered service
    for (const subscriber of this.subscribers) {
      service.subscribeAll(
        subscriber.callback,
        subscriber.beforeChangeValidationPromise,
        subscriber.afterChangeCallback
      );
    }
  }

  /**
   * Subscribes globally to all currently registered context services and ensures that future ones
   * receive the same callbacks as well.
   *
   * @param callback - Function that will be called for every value change.
   * @param beforeChangeValidationPromise - Optional validation function called before value is applied.
   * @param afterChangeCallback - Optional function called after value is updated.
   * @returns A function that unsubscribes from all context changes.
   */
  subscribeToAllRegisteredContexts(
    callback: ValueChangeCallback<unknown>,
    beforeChangeValidationPromise?: BeforeChangeValidationPromise<unknown>,
    afterChangeCallback?: ValueChangeCallback<unknown>
  ): () => void {
    const unsubFns: (() => void)[] = [];

    // Subscribe to already registered context services
    for (const service of this.services) {
      unsubFns.push(service.subscribeAll(callback, beforeChangeValidationPromise, afterChangeCallback));
    }

    const subscriber: GlobalSubscription = {
      callback,
      beforeChangeValidationPromise,
      afterChangeCallback
    };

    this.subscribers.push(subscriber);

    // Return idempotent unsubscribe function
    let unsubscribed = false;
    return () => {
      if (unsubscribed) {
        return;
      }
      unsubscribed = true;

      // Unsubscribe from all previously registered services
      unsubFns.forEach(unsub => unsub());

      // Remove global subscriber
      const index = this.subscribers.indexOf(subscriber);
      if (index >= 0) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}
