import {ToastType} from './toast-type';
import {GeneratorUtils} from '@ontotext/workbench-api';
import {ToastConfig} from './toast-config';

/**
 * Represents a toast notification message with type, content, and configuration.
 */
export class ToastMessage {
  /** Unique identifier for the toast message */
  id: string;

  /** The type of toast message (e.g., 'success', 'error', 'warning', 'info') */
  type: ToastType;

  title: string;

  /** The content text to be displayed in the toast notification */
  message: string;

  /** Additional configuration for the toast message */
  config?: ToastConfig;

  constructor(type: ToastType, message: string, title = '', config?: ToastConfig) {
    this.id = GeneratorUtils.uuid();
    this.type = type;
    this.title = title;
    this.message = message;
    this.config = config;
  }
}
