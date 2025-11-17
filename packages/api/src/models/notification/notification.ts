import {NotificationType} from './notification-type';
import {IdModel} from '../common/id-model';

/**
 * Represents a notification message with a unique identifier, a code, and optional parameters.
 */
export class Notification extends IdModel<Notification> {

  /**
   * The code representing the type of the notification.
   */
  readonly code: string;

  /**
   * Optional title for the notification.
   */
  title?: string;

  /**
   * The notification type.
   */
  type?: NotificationType;

  /**
   * Optional key-value parameters associated with the notification.
   */
  parameters?: Record<string, unknown>;

  /**
   * Creates a new Notification instance with the specified code and optional additional fields.
   *
   * @param code - The code representing the notification type.
   */
  constructor(code: string) {
    super();
    this.code = code;
  }

  /**
   * Sets the title of the notification.
   *
   * @param title - The title to set.
   * @returns This notification instance for method chaining.
   */
  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  /**
   * Sets the type of the notification.
   *
   * @param type - The notification type to set.
   * @returns This notification instance for method chaining.
   */
  withType(type: NotificationType): this {
    this.type = type;
    return this;
  }

  /**
   * Sets the parameters of the notification.
   *
   * @param parameters - The parameters to set.
   * @returns This notification instance for method chaining.
   */
  withParameters(parameters: Record<string, unknown>): this {
    this.parameters = parameters;
    return this;
  }

  static info(code: string): Notification {
    return new Notification(code).withType(NotificationType.INFO);
  }

  static error(code: string): Notification {
    return new Notification(code).withType(NotificationType.ERROR);
  }

  static warning(code: string): Notification {
    return new Notification(code).withType(NotificationType.WARNING);
  }

  static success(code: string): Notification {
    return new Notification(code).withType(NotificationType.SUCCESS);
  }
}
