export class ConfirmationDialogSteps {
    static getConfirmation() {
        return cy.get('.confirmation-dialog');
    }

    static confirm() {
        this.getConfirmation().find('.confirm-button').click();
    }

    static reject() {
        this.getConfirmation().find('.cancel-button').click();
    }
}
