import {ContextService} from './context.service';
import {Service} from '../../providers/service/service';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {BeforeChangeValidationPromise} from '../../models/context/before-change-validation-promise';
import {ServiceProvider} from '../../providers';
import {SubscriptionList} from '../../models/common';

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
 * Manages subscriptions to value changes across all registered ContextService instances.
 *
 * This class enables centralized handling of property change events, allowing consumers to subscribe
 * to all context-managed values at once, including those from context registered later.
 */
export class ContextSubscriptionManager implements Service {
  private readonly subscribers: GlobalSubscription[] = [];

  /**
   * Subscribes a ContextService instance to all currently registered global subscriptions.
   *
   * This ensures that the provided service receives all value change notifications
   * configured through {@link subscribeToAllRegisteredContexts}.
   *
   * @param service - The ContextService instance whose properties should be globally observed.
   * @returns A function that, when called, unsubscribes this service from all global subscriptions.
   */
  subscribeToService(service: ContextService<Record<string, unknown>>): () => void {
    const unsubFns: (() => void)[] = this.subscribers.map(sub =>
      service.subscribeAll(
        sub.callback,
        sub.beforeChangeValidationPromise,
        sub.afterChangeCallback
      )
    );
    return () => unsubFns.forEach(unsub => unsub());
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
    const unsubFns: SubscriptionList = new SubscriptionList();

    const services = ServiceProvider.getAllBySuperType(ContextService)
      .filter(service => service.canSubscribeAll);
    // Subscribe to already registered context services
    for (const service of services) {
      unsubFns.add(service.subscribeAll(callback, beforeChangeValidationPromise, afterChangeCallback));
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
      unsubFns.unsubscribeAll();

      // Remove global subscriber
      const index = this.subscribers.indexOf(subscriber);
      if (index >= 0) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}
