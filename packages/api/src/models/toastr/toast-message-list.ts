import {ToastMessage} from './toast-message';
import {ModelList} from '../common';

/**
 * Represents a collection of toast messages.
 */
export class ToastMessageList extends ModelList<ToastMessage> {
  /**
   * Creates a new instance of ToastMessageList.
   *
   * @param toasts - Optional array of ToastMessage objects to initialize the list with.
   */
  constructor(toasts?: ToastMessage[]) {
    super(toasts);
  }
}
