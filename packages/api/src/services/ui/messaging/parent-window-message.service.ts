import {Service} from '../../../providers/service/service';
import {WindowService} from '../../window';

/**
 * Service that provides functionality for posting messages to the parent window. This is useful for communication
 * between an iframe or child window and its parent window, allowing for data exchange and interaction between
 * the two contexts.
 */
export class ParentWindowMessageService implements Service {
  /**
   * Posts a message to the parent window using the postMessage API. This method allows for sending data from the
   * current window (which may be an iframe or child window) to its parent window.
   * @param message The message to be sent to the parent window. This can be of any type, such as a string, object, or
   * array.
   * @param targetOrigin The origin that the parent window must have for the message to be received. This is a security
   * measure to ensure that the message is only received by the intended recipient. By default, this is set to '*',
   * which means that the message will be sent to any origin. It is recommended to specify a more restrictive
   * targetOrigin in production environments to enhance security.
   * @returns void
   */
  postMessage<T>(message: T, targetOrigin = '*') {
    WindowService.getParentWindow().postMessage(message, targetOrigin);
  }
}
