import {ModalDialogSteps} from "../modal-dialog-steps";

export class FileOverwriteDialogSteps extends ModalDialogSteps {

    static overwrite() {
        this.getDialog().find('.confirm-overwrite-btn').click();
    }

    static cancel() {
        this.getDialog().find('.cancel-btn').click();
    }

    static keepBoth() {
        this.getDialog().find('.keep-both-btn').click();
    }
}
