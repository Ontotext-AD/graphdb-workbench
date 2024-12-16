import { ModelList } from './model-list';
import { Subscription } from './subscription';

/**
 * Represents a list of subscriptions that can be managed collectively.
 * Extends the {@link ModelList} class, specialized for {@link Subscription} type.
 */
export class SubscriptionList extends ModelList<Subscription> {
  /**
   * Creates a new instance of SubscriptionList.
   * @param subscriptions - An optional array of Subscription functions to initialize the list.
   */
  constructor(subscriptions?: Subscription[]) {
    super(subscriptions);
  }
  
  /**
   * Adds a new subscription to the list.
   * @param subscription - The Subscription function to be added to the list.
   */
  add(subscription: Subscription): void {
    this.items.push(subscription);
  }
  
  /**
   * Calls all subscription functions in the list and then clears the list. Calling a subscription
   * function unsubscribes the subscription. This effectively unsubscribes all subscriptions
   * and removes them from the list.
   */
  unsubscribeAll(): void {
    this.items.forEach(subscription => subscription());
    this.items = [];
  }
}
