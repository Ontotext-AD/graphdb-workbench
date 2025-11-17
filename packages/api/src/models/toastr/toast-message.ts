import {ToastType} from './toast-type';
import {ToastConfig} from './toast-config';
import {IdModel} from '../common/id-model';

/**
 * Represents a toast notification message with type, content, and configuration.
 */
export class ToastMessage extends IdModel<ToastMessage>{
  /** The type of toast message (e.g., 'success', 'error', 'warning', 'info') */
  type: ToastType;

  /** The content text to be displayed in the toast notification */
  message: string;

  /** Additional configuration for the toast message */
  config?: ToastConfig;

  constructor(type: ToastType, message: string, config?: ToastConfig) {
    super();
    this.type = type;
    this.message = message;
    this.config = config;
  }
}
