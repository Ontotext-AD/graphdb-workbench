import { NotificationType } from '../../models/notification/notification-type';
import { Notification } from '../../models/notification/notification';

/**
 * A fluent builder class for constructing {@link Notification} instances.
 *
 * The `NotificationBuilder` simplifies the creation of notifications by allowing
 * a step-by-step configuration of notification attributes such as type, title,
 * and parameters before generating the final immutable {@link Notification} object.
 *
 * @example
 * ```ts
 * const notification = NotificationBuilder
 *   .getNotificationBuilder(NotificationType.INFO, 'USER_CREATED')
 *   .setTitle('User Created Successfully')
 *   .setParameters({ username: 'JohnDoe' })
 *   .getNotification();
 * ```
 */
export class NotificationBuilder {
  private type: NotificationType = NotificationType.INFO;
  private code = '';
  private title = '';
  private parameters?: Record<string, string>;

  /**
   * Creates and initializes a new {@link NotificationBuilder} for a given type and code.
   *
   * @param {NotificationType} type - The type of the notification (e.g. INFO, SUCCESS, WARNING, ERROR).
   * @param {string} code - The notification code or message key.
   * @returns {NotificationBuilder} A new builder instance configured with the provided type and code.
   */
  static getNotificationBuilder(type: NotificationType, code: string): NotificationBuilder {
    const notificationBuilder = new NotificationBuilder();
    notificationBuilder.code = code;
    notificationBuilder.type = type;
    return notificationBuilder;
  }

  /**
   * Sets the title of the notification.
   *
   * @param {string} title - The title text to display in the notification.
   * @returns {NotificationBuilder} The current builder instance for method chaining.
   */
  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  /**
   * Sets the parameters for the notification.
   *
   * Parameters can be used for dynamic message interpolation or additional
   * metadata passed to the notification.
   *
   * @param {Record<string, string>} parameters - Key-value pairs representing notification parameters.
   * @returns {NotificationBuilder} The current builder instance for method chaining.
   */
  setParameters(parameters: Record<string, string>): this {
    this.parameters = parameters;
    return this;
  }

  /**
   * Builds and returns a new {@link Notification} instance
   * using the properties currently configured in this builder.
   *
   * @returns {Notification} The constructed notification object.
   */
  getNotification(): Notification {
    return new Notification(this.code, {
      type: this.type,
      title: this.title,
      parameters: this.parameters
    });
  }
}

/**
 * Creates a new {@link NotificationBuilder} for an ERROR notification.
 *
 * @param {string} code - The notification code or message key.
 * @returns {NotificationBuilder} A builder preconfigured with type `NotificationType.ERROR`.
 */
export function errorNotificationBuilder(code: string): NotificationBuilder {
  return NotificationBuilder.getNotificationBuilder(NotificationType.ERROR, code);
}

/**
 * Creates a new {@link NotificationBuilder} for a SUCCESS notification.
 *
 * @param {string} code - The notification code or message key.
 * @returns {NotificationBuilder} A builder preconfigured with type `NotificationType.SUCCESS`.
 */
export function successNotificationBuilder(code: string): NotificationBuilder {
  return NotificationBuilder.getNotificationBuilder(NotificationType.SUCCESS, code);
}

/**
 * Creates a new {@link NotificationBuilder} for a WARNING notification.
 *
 * @param {string} code - The notification code or message key.
 * @returns {NotificationBuilder} A builder preconfigured with type `NotificationType.WARNING`.
 */
export function warningNotificationBuilder(code: string): NotificationBuilder {
  return NotificationBuilder.getNotificationBuilder(NotificationType.WARNING, code);
}

/**
 * Creates a new {@link NotificationBuilder} for an INFO notification.
 *
 * @param {string} code - The notification code or message key.
 * @returns {NotificationBuilder} A builder preconfigured with type `NotificationType.INFO`.
 */
export function infoNotificationBuilder(code: string): NotificationBuilder {
  return NotificationBuilder.getNotificationBuilder(NotificationType.INFO, code);
}
