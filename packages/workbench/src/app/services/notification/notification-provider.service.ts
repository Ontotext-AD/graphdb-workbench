import {Injectable} from '@angular/core';
import {Notification, NotificationParam, notify} from '@ontotext/workbench-api';
import {NotificationOptions} from '../../models/notification-options';

/**
 * Angular service for displaying toast notifications.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationProviderService {

  /**
   * Displays an error toast notification.
   *
   * @param message - The text message to display in the toast body
   * @param options - Configuration options for the notification, such as title and extra parameters
   */
  error(message: string, options?: NotificationOptions): void {
    const notification = Notification.error(message);
    this.show(notification, options);
  }

  /**
   * Displays an informational toast notification.
   *
   * @param message - The text message to display in the toast body
   * @param options - Configuration options for the notification, such as title and extra parameters
   */
  info(message: string, options?: NotificationOptions): void {
    const notification = Notification.info(message);
    this.show(notification, options);
  }

  /**
   * Displays a success toast notification.
   *
   * @param message - The text message to display in the toast body
   * @param options - Configuration options for the notification, such as title and extra parameters
   */
  success(message: string, options?: NotificationOptions): void {
    const notification = Notification.success(message);
    this.show(notification, options);
  }

  /**
   * Displays a warning toast notification.
   *
   * @param message - The text message to display in the toast body
   * @param options - Configuration options for the notification, such as title and extra parameters
   */
  warning(message: string, options?: NotificationOptions): void {
    const notification = Notification.warning(message);
    this.show(notification, options);
  }

  /**
   * Triggers the given notification.
   *
   * @param notification - The fully constructed notification to dispatch
   * @param options - Configuration options for the notification, such as title and extra parameters
   */
  private show(notification: Notification, options?: NotificationOptions): void {
    if (options?.title) {
      notification.withTitle(options.title);
    }
    notification
      .withParameters({...options?.parameters, [NotificationParam.SHOULD_TOAST]: true});
    notify(notification);
  }
}
