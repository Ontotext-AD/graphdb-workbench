import {
  errorNotificationBuilder,
  infoNotificationBuilder,
  NotificationBuilder,
  successNotificationBuilder,
  warningNotificationBuilder
} from '../notification-builder';
import { NotificationType } from '../../../models/notification';

describe('NotificationBuilder', () => {

  it('getNotificationBuilder should return a notification with an empty title if none is set', () => {
    // WHEN: I use the notification builder without setting a title.
    const notificationBuilder = NotificationBuilder.getNotificationBuilder(NotificationType.INFO, 'Notification message');

    // THEN: I expect the title to be an empty string.
    expect(notificationBuilder.getNotification().title).toEqual('');
  });

  it('getNotificationBuilder should return a notification with a title when one is set', () => {
    // WHEN: I use the notification builder and set a title.
    const notificationTitle = 'Notification title';
    const notificationBuilder = NotificationBuilder.getNotificationBuilder(NotificationType.INFO, 'Notification message')
      .setTitle(notificationTitle);

    // THEN: I expect the title to have been set.
    expect(notificationBuilder.getNotification().title).toEqual(notificationTitle);
  });

  it('getNotificationBuilder should return a notification without parameters if they are not set', () => {
    // WHEN: I use the notification builder without setting parameters.
    const notificationBuilder = NotificationBuilder.getNotificationBuilder(NotificationType.INFO, 'Notification message');

    // THEN: I expect the parameters to be undefined.
    expect(notificationBuilder.getNotification().parameters).toBeUndefined();
  });

  it('getNotificationBuilder should return a notification with parameters when they are set', () => {
    // WHEN: I use the notification builder and set parameters.
    const notificationParameters = { parameterOne: 'Value of parameter' };
    const notificationBuilder = NotificationBuilder.getNotificationBuilder(NotificationType.INFO, 'Notification message')
      .setParameters(notificationParameters);

    // THEN: I expect the parameters to have been set.
    expect(notificationBuilder.getNotification().parameters).toBe(notificationParameters);
  });

  it('errorNotificationBuilder should produce a notification of type ERROR', () => {
    // GIVEN: I create an error notification builder.
    const notificationMessage = 'Error notification message';
    const notificationBuilder = errorNotificationBuilder(notificationMessage);

    // WHEN: I create a notification using the builder.
    const notification = notificationBuilder.getNotification();

    // THEN: I expect the created notification to be of type ERROR.
    expect(notification.type).toBe(NotificationType.ERROR);
  });

  it('successNotificationBuilder should produce a notification of type SUCCESS', () => {
    // GIVEN: I create a success notification builder.
    const notificationMessage = 'Success notification message';
    const notificationBuilder = successNotificationBuilder(notificationMessage);

    // WHEN: I create a notification using the builder.
    const notification = notificationBuilder.getNotification();

    // THEN: I expect the created notification to be of type SUCCESS.
    expect(notification.type).toBe(NotificationType.SUCCESS);
  });

  it('warningNotificationBuilder should produce a notification of type WARNING', () => {
    // GIVEN: I create a warning notification builder.
    const notificationMessage = 'Warning notification message';
    const notificationBuilder = warningNotificationBuilder(notificationMessage);

    // WHEN: I create a notification using the builder.
    const notification = notificationBuilder.getNotification();

    // THEN: I expect the created notification to be of type WARNING.
    expect(notification.type).toBe(NotificationType.WARNING);
  });

  it('infoNotificationBuilder should produce a notification of type INFO', () => {
    // GIVEN: I create an info notification builder.
    const notificationMessage = 'Info notification message';
    const notificationBuilder = infoNotificationBuilder(notificationMessage);

    // WHEN: I create a notification using the builder.
    const notification = notificationBuilder.getNotification();

    // THEN: I expect the created notification to be of type INFO.
    expect(notification.type).toBe(NotificationType.INFO);
  });
});
