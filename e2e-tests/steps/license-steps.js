import {BaseSteps} from "./base-steps";

export class LicenseSteps extends BaseSteps {
    static visit() {
        cy.visit('/license');
    }

    static getLicensePage() {
        return this.getByTestId('license-info-page');
    }

    static getLicenseAlertButton() {
        return this.getByTestId('onto-license-alert');
    }

    static getLicenseHeader() {
        return LicenseSteps.getLicensePage().find('.card-header');
    }

    static getRemoveLicenseButton() {
        return LicenseSteps.getLicensePage().getByTestId('remove-license-button');
    }

    static getSetNewLicenseButton() {
        return LicenseSteps.getLicensePage().getByTestId('set-new-license-link');
    }

    static getNoValidLicenseAlert() {
        return LicenseSteps.getLicensePage().getByTestId('no-valid-license-alert');
    }

    static getNoValidLicenseAlertTitle() {
        return LicenseSteps.getLicensePage().getByTestId('no-valid-license-title');
    }

    static getValidLicenseAlertTitle() {
        return LicenseSteps.getLicensePage().getByTestId('valid-license-title');
    }

    static getValidLicenseContent() {
        return LicenseSteps.getLicensePage().getByTestId('valid-license-content');
    }

    static getHardcodedAlertMessage() {
        return cy.get('.license-hardcoded-alert-message');
    }

    static verifyNoValidLicense() {
       LicenseSteps.getLicensePage().should('be.visible');
       LicenseSteps.getLicenseAlertButton().should('be.visible');
       LicenseSteps.getRemoveLicenseButton().should('be.visible').should('be.disabled');
       LicenseSteps.getSetNewLicenseButton().should('be.visible');
       LicenseSteps.getNoValidLicenseAlert().should('be.visible');
       LicenseSteps.getNoValidLicenseAlertTitle().should('exist');
       LicenseSteps.getValidLicenseAlertTitle().should('not.exist');
       LicenseSteps.getValidLicenseContent().should('not.exist');
    }

    static verifyValidLicense() {
        LicenseSteps.getLicensePage().should('be.visible');
        LicenseSteps.getLicenseAlertButton().should('not.exist');
        LicenseSteps.getRemoveLicenseButton().should('be.visible').should('be.enabled');
        LicenseSteps.getSetNewLicenseButton().should('be.visible');
        LicenseSteps.getNoValidLicenseAlert().should('not.exist');
        LicenseSteps.getNoValidLicenseAlertTitle().should('not.exist');
        LicenseSteps.getValidLicenseAlertTitle().should('exist');
        LicenseSteps.getValidLicenseContent().should('exist');
    }
}
