export class LicenseWidgetSteps {
    static getWidget() {
        return cy.get('.license-widget');
    }

    static getLicenseWidgetHeader() {
        return LicenseWidgetSteps.getWidget().find('#license-label-home');
    }
}
