import {CancelDialogAction} from './cancel-dialog-action';

export type ConfirmCancelCallback = (action: CancelDialogAction) => void;

export class ConfirmCancelPayload {
  constructor(
    public readonly hasDontShowAgain: boolean,
    public readonly onClose: ConfirmCancelCallback
  ) {}
}
