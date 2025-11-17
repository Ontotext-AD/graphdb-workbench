import {NotificationType} from '../../../models/notification/notification-type';
import {Notification} from '../../../models/notification';
import {ToastMessage, ToastType} from '../../../models/toastr';
import {TranslationParameter} from '../../../models/translation';
import {NotificationParam} from '../../../models/notification/notification-param';
import {ClassNotInitializableError} from '../../../error/class-not-initializable/class-not-initializable-error';

const notificationToToastTypeMap: Record<NotificationType, ToastType> = {
  [NotificationType.ERROR]: ToastType.ERROR,
  [NotificationType.SUCCESS]: ToastType.SUCCESS,
  [NotificationType.WARNING]: ToastType.WARNING,
  [NotificationType.INFO]: ToastType.INFO
};

/**
 * Mapper class for mapping OntoNotification to ToastMessage.
 */
export class OntoToastrMapper {
  private constructor() {
    /* Only static methods. New instances shouldn't be created. */
    throw new ClassNotInitializableError();
  }

  /**
   * Maps OntoNotification to ToastMessage.
   * @param notification - OntoNotification to be mapped.
   */
  static fromNotification(notification: Notification): ToastMessage {
    const type = this.notificationTypeToToastType(notification.type);
    return new ToastMessage(type, notification.code, {
      title: notification.title,
      translationParams: this.toTranslationParams(notification.parameters)
    });
  };

  private static notificationTypeToToastType(notificationType?: NotificationType): ToastType {
    return notificationType ? notificationToToastTypeMap[notificationType] : ToastType.INFO;
  }

  private static toTranslationParams(parameters?: Record<NotificationParam, unknown>): TranslationParameter[] {
    if (!parameters) {
      return [];
    }

    // convert the params to an array of TranslationParameter. All values are converted to string.
    return Object.entries(parameters)
      .map(([key, value]) => ({
        key,
        value: String(value)
      }));
  }
}
