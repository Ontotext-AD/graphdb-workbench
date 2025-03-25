export class LicenseSteps {
    static visit() {
        cy.visit('/license');
    }

    static getLicense() {
        return cy.get('.license-container');
    }

    static getLicenseHeader() {
        return LicenseSteps.getLicense().find('.card-header');
    }

    static getHardcodedAlertMessage() {
        return cy.get('.license-hardcoded-alert-message');
    }

    static getRemoveLicenseLicenseButton() {
        return LicenseSteps.getLicense().find('.revert-to-free-license-btn');
    }

    static getSetNewLicenseElement() {
        return LicenseSteps.getLicense().find('.set-new-license-link');
    }
}
