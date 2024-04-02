import {ModalDialogSteps} from "../modal-dialog-steps";

export class ImportSettingsDialogSteps extends ModalDialogSteps {
    static getImportButton() {
        return this.getDialog().find('.import-settings-import-button');
    }

    static import() {
        this.getImportButton().click();
    }

    static getCancelImportButton() {
        return this.getDialog().find('.cancel-import-button');
    }

    static cancelImport() {
        this.getCancelImportButton().click();
    }
}
