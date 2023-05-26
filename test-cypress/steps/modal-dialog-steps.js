export class ModalDialogSteps {
    static getDialog() {
        return cy.get('.modal-dialog');
    }

    static getDialogHeader() {
        return ModalDialogSteps.getDialog().find('.modal-header');
    }

    static getCloseButton() {
        return ModalDialogSteps.getDialogHeader().find('.close');
    }

    static clickOnCloseButton() {
        ModalDialogSteps.getCloseButton().click();
    }

    static getDialogBody() {
        return ModalDialogSteps.getDialog().find('.modal-body');
    }

    static getDialogFooter() {
        return ModalDialogSteps.getDialog().find('.modal-footer');
    }

    static getConfirmButton() {
        return ModalDialogSteps.getDialogFooter().find('.confirm-btn');
    }

    static clickOnConfirmButton() {
        ModalDialogSteps.getConfirmButton().click();
    }

    static getCancelButton() {
        return ModalDialogSteps.getDialogFooter().find('.cancel-btn');
    }

    static clickOnCancelButton() {
        ModalDialogSteps.getCancelButton().click();
    }
}
