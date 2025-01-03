import {ModalDialogSteps} from "../modal-dialog-steps";

export class ImportResourceMessageDialog extends ModalDialogSteps {
    static getDialog() {
        return super.getDialog('.import-resource-message-dialog');
    }

    static getCloseButton() {
        return ImportResourceMessageDialog.getDialogFooter().find('.close-btn');
    }

    static clickOnCloseButton() {
        ImportResourceMessageDialog.getCloseButton().click();
    }

    static getMessage() {
        return this.getDialogBody().find('.message');
    }

    static getCopyToClipboard() {
        return ImportResourceMessageDialog.getDialogFooter().find('.copy-to-clipboard-btn');
    }

    static copyToClipboard() {
        ImportResourceMessageDialog.getCopyToClipboard().click();
    }
}
