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
  readonly title?: string;

  /**
   * The notification type.
   */
  readonly type?: NotificationType;

  /**
   * Optional key-value parameters associated with the notification.
   */
  readonly parameters?: Record<string, string>;

  /**
   * Creates a new Notification instance with the specified code and optional additional fields.
   *
   * @param code - The code representing the notification type.
   * @param notification - Optional object to set additional fields (`title` or `parameters`), excluding `code`.
   */
  constructor(code: string, notification?: Partial<Omit<Notification, 'code'>>) {
    super();
    this.code = code;
    this.type = NotificationType.INFO;
    if (notification) {
      this.parameters = notification.parameters;
      this.title = notification.title;
      this.type = notification.type || NotificationType.INFO;
    }
  }
}
