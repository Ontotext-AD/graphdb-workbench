/**
 * Steps for the confirmation dialog of the new (Angular) views. The dialog is declared once in the application root
 * and PrimeNG renders it at the end of the body, outside any page. It is located by its ARIA role together with the
 * confirm-dialog class, because PrimeNG also puts the role on the always present, empty p-dialog wrapper. Its parts
 * are located by data-test.
 */
export class ConfirmDialogSteps {
    static getDialog() {
        return cy.get('[role="alertdialog"].confirm-dialog');
    }

    static getContent() {
        return this.getDialog().getByTestId('confirm-dialog-content');
    }

    static getConfirmButton() {
        return this.getDialog().getByTestId('confirm-dialog-confirm-btn');
    }

    static getCancelButton() {
        return this.getDialog().getByTestId('confirm-dialog-cancel-btn');
    }

    static confirm() {
        this.getConfirmButton().click();
        this.getDialog().should('not.exist');
    }

    static cancel() {
        this.getCancelButton().click();
        this.getDialog().should('not.exist');
    }
}
