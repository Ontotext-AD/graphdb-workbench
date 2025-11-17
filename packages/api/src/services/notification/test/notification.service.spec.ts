import { NotificationService, notify } from '../notification.service';
import { service } from '../../../providers';
import { Notification } from '../../../models/notification';

describe('NotificationService', () => {
  const notification = new Notification('A new notification message');
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = service(NotificationService);
    notificationService.removeAllNotifications();
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
});
