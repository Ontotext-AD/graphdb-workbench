import {ToastType} from '../../../models/toastr/toast-type';
import {TranslationParameter} from '../../../models/translation/translation-parameter';
import {ToastMessage} from '../../../models/toastr/toast-message';
import {TranslationService} from '../../../services/translation.service';
import {
  Notification,
  NotificationType
} from '@ontotext/workbench-api';

export function notificationTypeToToastType(notificationType: NotificationType): ToastType {
  switch (notificationType) {
  case NotificationType.ERROR:
    return ToastType.ERROR;
  case NotificationType.SUCCESS:
    return ToastType.SUCCESS;
  case NotificationType.WARNING:
    return ToastType.WARNING;
  default:
    return ToastType.INFO;
  }
}

export const toTranslationParameters = (parameters: Record<string, string> = {}): TranslationParameter[] => {
  return Object.entries(parameters).map(([key, value]) => ({
    key,
    value
  }));
};

export const toToastMessage = (notification: Notification): ToastMessage => {
  let translationParameters = toTranslationParameters(notification.parameters);
  const message = TranslationService.translate(notification.code, translationParameters);
  const title = notification.title ? TranslationService.translate(notification.title, translationParameters) : '';
  const type = notificationTypeToToastType(notification.type);
  return new ToastMessage(type, message, title);
};
