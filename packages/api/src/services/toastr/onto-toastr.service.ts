import {Service} from '../../providers/service/service';
import {ToastMessage} from '../../models/toastr/toast-message';
import {ToastType} from '../../models/toastr/toast-type';
import {CREATE_TOAST_EVENT} from '../../models/toastr/toastr-constants';
import {EventEmitter} from '../../emitters/event.emitter';

/**
 * Service for displaying toast notifications in the application.
 */
export class OntoToastrService implements Service {
  private readonly eventEmitter = new EventEmitter<ToastMessage>();

  /**
   * Displays an error toast notification.
   *
   * @param message - The text message to be displayed in the toast
   */
  error(message: string): void {
    this.createToastElement(message, ToastType.ERROR);
  }

  /**
   * Displays an informational toast notification.
   *
   * @param message - The text message to be displayed in the toast
   */
  info(message: string): void {
    this.createToastElement(message, ToastType.INFO);
  }

  /**
   * Displays a success toast notification.
   *
   * @param message - The text message to be displayed in the toast
   */
  success(message: string): void {
    this.createToastElement(message, ToastType.SUCCESS);
  }

  /**
   * Displays a warning toast notification.
   *
   * @param message - The text message to be displayed in the toast
   */
  warning(message: string): void {
    this.createToastElement(message, ToastType.WARNING);
  }

  private createToastElement(message: string, type: ToastType): void {
    this.eventEmitter.emit({NAME: CREATE_TOAST_EVENT, payload: new ToastMessage(type, message)});
  }
}
