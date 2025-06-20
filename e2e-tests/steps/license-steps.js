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

    static getNoLicenseAlertTitle() {
        return LicenseSteps.getLicensePage().getByTestId('no-license-title');
    }

    static getValidLicenseAlertTitle() {
        return LicenseSteps.getLicensePage().getByTestId('valid-license-title');
    }

    static getLicenseContent() {
        return LicenseSteps.getLicensePage().getByTestId('license-content');
    }

    static getHardcodedAlertMessage() {
        return cy.getByTestId('license-hardcoded-alert-message');
    }

    static verifyLicenseNotSet() {
        LicenseSteps.getLicensePage().should('be.visible');
        LicenseSteps.getLicenseAlertButton().should('exist');
        LicenseSteps.getRemoveLicenseButton().should('be.visible').should('be.disabled');
        LicenseSteps.getSetNewLicenseButton().should('be.visible');
        LicenseSteps.getNoValidLicenseAlert().should('exist');
        LicenseSteps.getNoLicenseAlertTitle().should('exist');
        LicenseSteps.getValidLicenseAlertTitle().should('not.exist');
        LicenseSteps.getLicenseContent().should('not.exist');
        LicenseSteps.getHardcodedAlertMessage().should('not.exist');
    }

    static verifyNoValidLicense() {
       LicenseSteps.getLicensePage().should('be.visible');
       LicenseSteps.getLicenseAlertButton().should('be.visible');
       LicenseSteps.getRemoveLicenseButton().should('exist');
       LicenseSteps.getSetNewLicenseButton().should('be.visible');
       LicenseSteps.getNoValidLicenseAlert().should('be.visible');
       LicenseSteps.getNoLicenseAlertTitle().should('not.exist');
       LicenseSteps.getValidLicenseAlertTitle().should('exist');
       LicenseSteps.getLicenseContent().should('exist');
       LicenseSteps.getHardcodedAlertMessage().should('not.exist');
    }

    static verifyValidLicense() {
        LicenseSteps.getLicensePage().should('be.visible');
        LicenseSteps.getLicenseAlertButton().should('not.exist');
        LicenseSteps.getRemoveLicenseButton().should('be.visible').should('be.enabled');
        LicenseSteps.getSetNewLicenseButton().should('be.visible');
        LicenseSteps.getNoValidLicenseAlert().should('not.exist');
        LicenseSteps.getNoLicenseAlertTitle().should('not.exist');
        LicenseSteps.getValidLicenseAlertTitle().should('exist');
        LicenseSteps.getLicenseContent().should('exist');
        LicenseSteps.getHardcodedAlertMessage().should('not.exist');
    }

    static verifyNoValidLicenseHardcoded() {
        LicenseSteps.getLicensePage().should('be.visible');
        LicenseSteps.getLicenseAlertButton().should('be.visible');
        LicenseSteps.getRemoveLicenseButton().should('not.exist');
        LicenseSteps.getSetNewLicenseButton().should('not.exist');
        LicenseSteps.getNoValidLicenseAlert().should('exist');
        LicenseSteps.getNoLicenseAlertTitle().should('not.exist');
        LicenseSteps.getValidLicenseAlertTitle().should('exist');
        LicenseSteps.getLicenseContent().should('exist');
        LicenseSteps.getHardcodedAlertMessage().should('exist');
    }

    static verifyValidLicenseHardcoded() {
        LicenseSteps.getLicensePage().should('be.visible');
        LicenseSteps.getLicenseAlertButton().should('not.exist');
        LicenseSteps.getRemoveLicenseButton().should('not.exist');
        LicenseSteps.getSetNewLicenseButton().should('not.exist');
        LicenseSteps.getNoValidLicenseAlert().should('not.exist');
        LicenseSteps.getNoLicenseAlertTitle().should('not.exist');
        LicenseSteps.getValidLicenseAlertTitle().should('exist');
        LicenseSteps.getLicenseContent().should('exist');
        LicenseSteps.getHardcodedAlertMessage().should('exist');
    }
}
