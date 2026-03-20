import {Service} from '../../providers/service/service';
import {EventEmitter} from '../../emitters/event.emitter';
import {CancelDialogAction} from '../../models/dialog/cancel-dialog-action';
import {CONFIRM_CANCEL_EVENT} from '../../models/dialog/dialog-constants';
import {ConfirmCancelCallback, ConfirmCancelPayload} from '../../models/dialog/dialog-payload';

/**
 * Service that opens a cancel confirmation dialog and returns the user's choice.
 *
 * Communicates with the `onto-confirm-cancel-dialog` Stencil component via a DOM event,
 * following the same pattern as {@link OntoToastrService}.
 */
export class DialogService implements Service {
  private readonly eventEmitter = new EventEmitter<ConfirmCancelPayload>();

  /**
   * Emits a confirm-cancel dialog event and returns a promise that resolves
   * with the user's choice once the dialog is interacted with.
   *
   * @param hasDontShowAgain - Whether to show the "Don't show again" button.
   * @returns A promise that resolves with the user's action.
   */
  confirmCancel(hasDontShowAgain: boolean): Promise<CancelDialogAction> {
    return new Promise((resolve) => {
      const onClose: ConfirmCancelCallback = (action) => resolve(action);
      this.eventEmitter.emit({
        NAME: CONFIRM_CANCEL_EVENT,
        payload: new ConfirmCancelPayload(hasDontShowAgain, onClose),
      });
    });
  }
}
