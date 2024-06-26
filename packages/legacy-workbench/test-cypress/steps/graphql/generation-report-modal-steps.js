import {ModalDialogSteps} from "../modal-dialog-steps";

export class GenerationReportModalSteps extends ModalDialogSteps {
    /**
     * Overrides the default method to get the dialog by specifying the class name. This is useful when there are multiple
     * modals on the same page.
     */
    static getDialog() {
        return cy.get('.endpoint-generation-failure-result-modal');
    }

    static getErrorsCount() {
        return this.getDialogBody().find('.errors-count');
    }

    static getWarningsCount() {
        return this.getDialogBody().find('.warnings-count');
    }

    static getErrors() {
        return this.getDialogBody().find('.error-row');
    }

    static getWarnings() {
        return this.getDialogBody().find('.warning-row');
    }

    /**
     * This method closes the report modal when it is opened on top of some other dialog.
     */
    static closeChildModal() {
        this.getCloseButton().eq(1).click();
    }
}
