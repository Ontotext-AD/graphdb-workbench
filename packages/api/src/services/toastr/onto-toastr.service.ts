import {Service} from '../../providers/service/service';
import {ToastMessage} from '../../models/toastr/toast-message';
import {ToastType} from '../../models/toastr/toast-type';
import {CREATE_TOAST_EVENT} from '../../models/toastr/toastr-constants';
import {EventEmitter} from '../../emitters/event.emitter';
import {ToastConfig} from '../../models/toastr/toast-config';
import {service} from '../../providers';
import {NotificationService} from '../notification/notification.service';
import {Notification} from '../../models/notification/notification';
import {OntoToastrMapper} from './mappers/onto-toastr.mapper';
import {NotificationParam} from '../../models/notification/notification-param';

/**
 * Service for displaying toast notifications in the application.
 */
export class OntoToastrService implements Service {
  private readonly eventEmitter = new EventEmitter<ToastMessage>();
  private readonly notificationService = service(NotificationService);

  constructor() {
    this.subscribeToNotificationEvents();
  }

  /**
   * Displays an error toast notification.
   *
   * @param message - The text message to be displayed in the toast
   * @param config - Additional configuration for the toast notification
   */
  error(message: string, config?: ToastConfig): void {
    this.createToastElement(message, ToastType.ERROR, config);
  }

  /**
   * Displays an informational toast notification.
   *
   * @param message - The text message to be displayed in the toast
   * @param config - Additional configuration for the toast notification
   */
  info(message: string, config?: ToastConfig): void {
    this.createToastElement(message, ToastType.INFO, config);
  }

  /**
   * Displays a success toast notification.
   *
   * @param message - The text message to be displayed in the toast
   * @param config - Additional configuration for the toast notification
   */
  success(message: string, config?: ToastConfig): void {
    this.createToastElement(message, ToastType.SUCCESS, config);
  }

  /**
   * Displays a warning toast notification.
   *
   * @param message - The text message to be displayed in the toast
   * @param config - Additional configuration for the toast notification
   */
  warning(message: string, config?: ToastConfig): void {
    this.createToastElement(message, ToastType.WARNING, config);
  }

  private createToastElement(message: string, type: ToastType, config?: ToastConfig): void {
    this.eventEmitter.emit({NAME: CREATE_TOAST_EVENT, payload: new ToastMessage(type, message, config)});
  }

  private subscribeToNotificationEvents(): void {
    this.notificationService.onNotificationAdded((notification: Notification) => {
      if (notification.parameters?.[NotificationParam.SHOULD_TOAST]) {
        const toast = OntoToastrMapper.fromNotification(notification);
        this.createToastElement(toast.message, toast.type, toast.config);
      }
    });
  }
}
