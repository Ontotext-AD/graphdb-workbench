import {Service} from '../../providers/service/service';
import {Queue} from '../../models/data-structures/queue';
import {Notification} from '../../models/notification';
import {service} from '../../providers';

/**
 * A service for managing notifications.
 *
 * This service provides methods to enqueue, dequeue, peek  notifications. It also allows subscribers to be notified
 * whenever a new notification is added, while keeping full control over queue manipulation.
 */
export class NotificationService implements Service {

  /**
   * Internal list of callback functions to notify when a notification is added.
   */
  private notificationAddedCallbackFunctions: (() => void)[] = [];

  /**
   * Internal queue storing the notifications.
   */
  private readonly notifications: Queue<Notification> = new Queue<Notification>();

  /**
   * Adds a notification to the end of the notification queue.
   *
   * @param notification - The notification to enqueue.
   */
  enqueue(notification: Notification): void {
    this.notifications.enqueue(notification);
    this.notifyAllNotificationAdded();
  }

  /**
   * Removes and returns the first notification from the notification queue.
   *
   * @returns The dequeued notification, or `undefined` if the queue is empty.
   */
  dequeue(): Notification | undefined {
    return this.notifications.dequeue();
  }

  /**
   * Removes all notifications from the notification queue and returns them.
   *
   * @returns An array containing all items that were in the queue.
   */
  dequeueAll(): Notification[] {
    return this.notifications.dequeueAll();
  }

  /**
   * Returns the first notification in the notification queue without removing it.
   *
   * @returns A deep copy of the first notification in the queue, or `undefined` if the queue is empty.
   */
  peek(): Notification | undefined {
    const notification = this.notifications.peek();
    if (notification) {
      return notification.copy();
    }
  }

  /**
   * Returns a shallow copy of all notifications currently in the queue without removing them.
   *
   * @returns An array containing all notifications in the queue.
   */
  peekAll(): Notification[] {
    return this.notifications.peekAll().map(notification => notification.copy());
  }

  /**
   * Checks whether the notification queue is empty.
   *
   * @returns `true` if the queue is empty, otherwise `false`.
   */
  isEmpty(): boolean {
    return this.notifications.isEmpty();
  }

  /**
   * Returns the number of notifications currently in the queue.
   *
   * @returns The number of notifications in the queue.
   */
  size(): number {
    return this.notifications.size();
  }

  /**
   * Registers a callback function to be invoked whenever a notification is added.
   * Subscribers are only notified of the change; they do not receive the notifications themselves.
   *
   * @param callbackFunction - The function to be called when the notification queue changes.
   * @returns A function to unsubscribe the callback.
   */
  onNotificationAdded(callbackFunction: () => void): () => void {
    if (callbackFunction && !this.notifications.isEmpty()) {
      this.notifyNotificationAdded(callbackFunction);
    }
    this.notificationAddedCallbackFunctions.push(callbackFunction);
    return () => {
      this.notificationAddedCallbackFunctions = this.notificationAddedCallbackFunctions.filter(fn => fn !== callbackFunction);
    };
  }

  /**
   * Invokes a single callback function.
   *
   * @param callbackFunction - The callback function to invoke.
   */
  private notifyNotificationAdded(callbackFunction: () => void): void {
    callbackFunction();
  }

  /**
   * Invokes all registered callback functions to notify subscribers of a queue change.
   */
  private notifyAllNotificationAdded(): void {
    for (const callback of this.notificationAddedCallbackFunctions) {
      callback();
    }
  }
}

/**
 * Enqueues a new notification using the global {@link NotificationService}.
 *
 * This function is a convenience wrapper that retrieves the singleton instance of the `NotificationService` via
 * the service locator and adds the provided notification to its queue.
 *
 * @param {Notification} notification - The notification instance to enqueue.
 */
export function notify(notification: Notification): void {
  service(NotificationService).enqueue(notification);
}
