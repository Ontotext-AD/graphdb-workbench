export class AlertDialogSteps {
    static getDialog(cssClass = '.modal-alert') {
        return cy.get(cssClass);
    }

    static getDialogHeader() {
        return AlertDialogSteps.getDialog().find('.modal-header');
    }

    static getCloseButton() {
        return AlertDialogSteps.getDialogHeader().find('.close');
    }

    static closeAlert() {
        AlertDialogSteps.getCloseButton().click();
    }

    static acceptAlert() {
        AlertDialogSteps.getDialog().find('.modal-footer button').click();
    }

    static getDialogBody() {
        return AlertDialogSteps.getDialog().find('.modal-body');
    }
}
