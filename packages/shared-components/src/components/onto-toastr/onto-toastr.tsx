import {Component, h, Listen, State} from '@stencil/core';
import {
  ToastMessage,
  ToastType,
  ToastMessageList,
  CREATE_TOAST_EVENT,
  ToastrConfig,
  WindowService
} from '@ontotext/workbench-api';
import {sanitizeHTML} from '../../utils/html-utils';

const toastTypeToIconMap = {
  [ToastType.INFO]: 'fa-circle-info',
  [ToastType.SUCCESS]: 'fa-circle-check',
  [ToastType.WARNING]: 'fa-message-lines',
  [ToastType.ERROR]: 'fa-triangle-exclamation',
};

/**
 * OntoToastr component for displaying toast notifications.
 *
 * This component manages a list of toast messages and handles their display,
 * automatic removal after timeout, and user interactions like hover behavior.
 */
@Component({
  tag: 'onto-toastr',
  styleUrl: 'onto-toastr.scss'
})
export class OntoToastr {
  /**
   * State containing the list of active toast messages
   */
  @State() private toasts: ToastMessageList = new ToastMessageList([]);

  /**
   * Map to track timeout IDs for each toast message
   */
  private toastToTimeout = new Map<ToastMessage, number>();

  /** Configuration options, such as toast timeout */
  private readonly config = ToastrConfig.getDefaultConfig();

  /**
   * Listen for toast creation events
   *
   * @param event - Custom event containing the toast message to be displayed
   */
  // TODO Fix jest tests are failing- usage variables in stencil decorators is enabled since 4.3.0
  // see https://github.com/stenciljs/core/issues/2924
  @Listen(CREATE_TOAST_EVENT, {target: 'body'})
  handleToastCreate(event: CustomEvent<ToastMessage>) {
    this.addToast(event.detail);
  }

  render() {
    return (
      <section style={{display: this.toasts.isEmpty() ? 'none' : 'flex'}}
               class={`onto-toastr-container ${this.config.position}`}>
        {this.toasts?.getItems().map((toast) => (
          <div class={`onto-toast toast ${toast.type}`} key={toast.id}
               onMouseEnter={this.onToastMouseEnter(toast)}
               onMouseLeave={this.onToastMouseLeave(toast)}>
              <i class={`fa-regular ${toastTypeToIconMap[toast.type]}`}></i>
              <span onClick={this.handleToastClick(toast)}
                    class="toast-message"
                    innerHTML={sanitizeHTML(toast.message)}></span>
          </div>
        ))}
      </section>
    );
  }

  private onToastMouseEnter = (toast: ToastMessage): EventListener => () => {
    this.clearToastTimeout(toast);
  };

  private onToastMouseLeave = (toast: ToastMessage): EventListener => () => {
    this.setTimeoutForToast(toast);
  };

  /**
   * Adds a new toast message.
   * The message is added to the start of the list, so new toasts appear on top.
   * The toast is also set to automatically be removed after the specified timeout.
   *
   * @param toast - The toast message to be added
   */
  private addToast(toast: ToastMessage): void {
    this.toasts.addToStart(toast);
    this.setTimeoutForToast(toast);
    this.updateToastrReference();
  }

  /**
   * Sets a timeout for automatic removal of a toast message.
   * The value of the timeout is determined by the toast's configuration, or the default timeout, if
   * the toast hasn't provided a value
   *
   * @param toast - The toast message to set timeout for
   */
  private setTimeoutForToast(toast: ToastMessage): void {
    const timeout = WindowService.getWindow().setTimeout(() => {
      this.toasts.remove(toast);
      this.clearToastTimeout(toast);
    }, toast.config?.timeout || this.config.timeout);
    this.toastToTimeout.set(toast, timeout);
  }

  /**
   * Updates the toast list reference to trigger re-rendering
   */
  private updateToastrReference() {
    this.toasts = new ToastMessageList(this.toasts.getItems());
  }

  /**
   * Clears the timeout for a toast message and removes it from the tracking map
   * When a user hovers over a toast message, the timeout is cleared, since the toast should
   * remain visible until the user stops hovering.
   *
   * @param toast - The toast message whose timeout should be cleared
   */
  private clearToastTimeout(toast: ToastMessage) {
    const timeoutId = this.toastToTimeout.get(toast);
    clearTimeout(timeoutId);
    this.toastToTimeout.delete(toast);
    this.updateToastrReference();
  }

  /**
   * Handle click events on toast messages.
   * Executes the configured onClick callback for the toast message, if provided.
   * Removes the toast message, if the removeOnClick configuration is enabled.
   *
   * @param toast - The clicked toast message
   * @returns An event handler function that processes click events on the toast
   */
  private handleToastClick(toast: ToastMessage) {
    return (event: Event) => {
      if (toast.config?.onClick) {
        toast.config.onClick(event);
      }

      if (toast.config?.removeOnClick) {
        this.toasts.remove(toast);
        this.clearToastTimeout(toast);
      }
    }
  }
}
