import { NotificationService, notify } from '../notification.service';
import { service } from '../../../providers';
import { Notification } from '../../../models/notification';

describe('NotificationService', () => {
  const notification = new Notification('A new notification message');
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = service(NotificationService);
    notificationService.dequeueAll();
  });

  it('onNotificationAdded should call all callback functions when a new notification is added', () => {
    // GIVEN: There are manu subscribers to listen for the new notifications.
    const callbackFunctionOne = jest.fn();
    const callbackFunctionTwo = jest.fn();
    notificationService.onNotificationAdded(callbackFunctionOne);
    notificationService.onNotificationAdded(callbackFunctionTwo);

    // WHEN: A new notification is added to the notification queue.
    notify(notification);

    // THEN: I expect all callback functions to be called.
    expect(callbackFunctionOne).toHaveBeenCalledTimes(1);
    expect(callbackFunctionTwo).toHaveBeenCalledTimes(1);
  });

  it('onNotificationAdded should not call unsubscribed callbacks', () => {
    // GIVEN: There are manu subscribers to listen for the new notifications.
    const callbackFunctionOne = jest.fn();
    const callbackFunctionTwo = jest.fn();
    notificationService.onNotificationAdded(callbackFunctionOne);
    const unsubscribeFunction = notificationService.onNotificationAdded(callbackFunctionTwo);

    // WHEN: A subscriber is unsubscribed and a new notification is added.
    unsubscribeFunction();
    notify(notification);

    // THEN: I expect only the active callback to be called.
    expect(callbackFunctionOne).toHaveBeenCalledTimes(1);
    expect(callbackFunctionTwo).toHaveBeenCalledTimes(0);
  });

  it('onNotificationAdded should call the subscriber immediately if notifications already exist', () => {
    // GIVEN: Notification service has a registered notification.
    notify(notification);

    // WHEN: A new subscriber is added.
    const callbackFunctionOne = jest.fn();
    notificationService.onNotificationAdded(callbackFunctionOne);

    // THEN: I expect the subscriber to be called immediately.
    expect(callbackFunctionOne).toHaveBeenCalledTimes(1);
  });

  it('enqueue should add a new notification', () => {
    // GIVEN: The notification service has no registered notifications.
    expect(notificationService.isEmpty()).toBeTruthy();

    // WHEN: I add a new notification.
    notificationService.enqueue(notification);

    // THEN: I expect the notification to be added to the queue.
    expect(notificationService.isEmpty()).toBeFalsy();
    expect(notificationService.size()).toBe(1);
  });

  it('dequeue should remove and return the first added notification', () => {
    // GIVEN: I have multiple notifications in the queue.
    notificationService.enqueue(notification);
    notificationService.enqueue(new Notification('Second notification message'));
    expect(notificationService.size()).toBe(2);

    // WHEN: I call dequeue.
    const dequeuedNotification = notificationService.dequeue();

    // THEN: I expect the first notification to be returned.
    expect(dequeuedNotification).toBe(notification);
    // AND: It should be removed from the queue.
    expect(notificationService.size()).toBe(1);
  });

  it('dequeueAll should remove and return all notifications', () => {
    // GIVEN: I have multiple notifications in the queue.
    notificationService.enqueue(notification);
    notificationService.enqueue(new Notification('Second notification message'));

    // WHEN: I call dequeueAll.
    const dequeuedNotifications = notificationService.dequeueAll();

    // THEN: I expect all notifications to be returned and the queue to be empty.
    expect(dequeuedNotifications).toHaveLength(2);
    expect(notificationService.isEmpty()).toBeTruthy();
  });

  it('peek should return the first notification without removing it', () => {
    // GIVEN: I have multiple notifications in the queue.
    notificationService.enqueue(notification);
    notificationService.enqueue(new Notification('Second notification message'));

    // WHEN: I call peek.
    const peekedNotification = notificationService.peek();

    // THEN: I expect a copy of the first notification to be returned.
    expect(peekedNotification).toEqual(notification);
    // AND: The notification should not be removed.
    expect(notificationService.size()).toBe(2);
  });

  it('peek should return undefined if there are no notifications', () => {
    // GIVEN: The queue is empty.
    expect(notificationService.isEmpty()).toBeTruthy();

    // WHEN: I call peek.
    const peekedNotification = notificationService.peek();

    // THEN: I expect undefined to be returned.
    expect(peekedNotification).toBeUndefined();
  });

  it('peekAll should return all notifications without removing them', () => {
    // GIVEN: I have multiple notifications in the queue.
    notificationService.enqueue(notification);
    notificationService.enqueue(new Notification('Second notification message'));

    // WHEN: I call peekAll.
    const peekedNotifications = notificationService.peekAll();

    // THEN: I expect all notifications to be returned without removal.
    expect(peekedNotifications).toHaveLength(2);
    expect(notificationService.size()).toBe(2);
  });

  it('peekAll should return an empty array if there are no notifications', () => {
    // GIVEN: The queue is empty.
    expect(notificationService.isEmpty()).toBeTruthy();

    // WHEN: I call peekAll.
    const peekedNotifications = notificationService.peekAll();

    // THEN: I expect an empty array to be returned.
    expect(peekedNotifications).toHaveLength(0);
  });
});
