import {LicenseStubs} from '../../../stubs/license-stubs';
import {LoginSteps} from '../../../steps/login-steps';
import {MainMenuSteps} from '../../../steps/main-menu-steps';
import ImportSteps from '../../../steps/import/import-steps';

Cypress.env('set_default_user_data', false);

describe('License on logout', () => {
    beforeEach(() => {
        cy.switchOnSecurity();
        cy.loginAsAdmin();
        LicenseStubs.spyGetLicense();
    });

    it('should not request the license when logging out from a legacy page', () => {
        // Given I am logged in and I am on a legacy page
        LoginSteps.visitInProdMode();
        LoginSteps.loginWithUser('admin', 'root');
        cy.wait('@get-license');
        MainMenuSteps.clickOnMenuImport();
        ImportSteps.getView().should('be.visible');
        // And the legacy workbench has loaded the license
        cy.wait('@get-license');
        // And the license is not accessible without a session
        LicenseStubs.stubLicenseUnauthorized();

        // When I log out
        LoginSteps.logout();
        LoginSteps.getLoginPage().should('be.visible');
        // And I log in again, which proves that the logout has been fully processed
        LicenseStubs.spyGetLicenseFromServer();
        LoginSteps.loginWithUser('admin', 'root');
        cy.wait('@get-license');

        // Then no license request was sent without a session
        cy.get('@unauthorizedLicense.all').should('have.length', 0);
    });
});
