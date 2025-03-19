import {ToastType} from './toast-type';
import {GeneratorUtils} from '../../services/utils/generator-utils';

/**
 * Represents a toast notification message with type, content, and configuration.
 */
export class ToastMessage {
  /** Unique identifier for the toast message */
  id: string;

  /** The type of toast message (e.g., 'success', 'error', 'warning', 'info') */
  type: ToastType;

  /** The content text to be displayed in the toast notification */
  message: string;

  constructor(type: ToastType, message: string) {
    this.id = GeneratorUtils.uuid();
    this.type = type;
    this.message = message;
  }
}
