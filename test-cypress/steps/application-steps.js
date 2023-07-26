export class ApplicationSteps {

    // notifications
    static getNotifications() {
        return cy.get('#toast-container');
    }

    static getSuccessNotifications() {
        return this.getNotifications().find('.toast-success');
    }

    static getErrorNotifications() {
        return this.getNotifications().find('.toast-error');
    }

    static getInfoNotification() {
        return this.getNotifications().find('.toast-info');
    }

    static getWarningNotification() {
        return this.getNotifications().find('.toast-warning');
    }
}
