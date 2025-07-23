import {ToasterSteps} from "./toaster-steps";

export class ApplicationSteps {

    // notifications
    static getNotifications() {
        return ToasterSteps.getToast()
    }

    static getSuccessNotifications() {
        return this.getNotifications().filter('.toast-success');
    }

    static getErrorNotifications() {
        return this.getNotifications().filter('.toast-error');
    }

    static getInfoNotification() {
        return this.getNotifications().filter('.toast-info');
    }

    static getWarningNotification() {
        return this.getNotifications().filter('.toast-warning');
    }

    // navigation via main menu
    static openImportPage() {
        cy.get('onto-navbar .menu-element').eq(0).click();
    }

    static geLoader() {
        return cy.get('.ot-loader-new-content');
    }

    static getCurrentDate() {
        // Returns the date in ISO format (yyyy-MM-dd) in the local time zone.
        // Using toISOString() returns in UTC, which may fail tests if run between specific times
        // in the local time zone.
        return new Date().toLocaleDateString("en-CA");
    }
}
