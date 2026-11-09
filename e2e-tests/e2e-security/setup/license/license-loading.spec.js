import {LicenseStubs} from '../../../stubs/license-stubs';
import {LoginSteps} from '../../../steps/login-steps';
import {HeaderSteps} from '../../../steps/header-steps';

Cypress.env('set_default_user_data', false);

describe('License loading', () => {
    beforeEach(() => {
        cy.switchOnSecurity();
        cy.loginAsAdmin();
        LicenseStubs.spyGetLicense();
    });

    context('when free access is off', () => {
        it('should load the license only for a logged in user', () => {
            // Given I am on the login page and I am not logged in
            LoginSteps.visitInProdMode();
            LoginSteps.getLoginPage().should('be.visible');
            // Then the license is not requested
            cy.get('@get-license.all').should('have.length', 0);

            // When I log in
            LoginSteps.loginWithUser('admin', 'root');
            // Then the license is requested
            cy.wait('@get-license');

            // When I reload the page
            cy.reload();
            // Then the license is requested again
            cy.wait('@get-license');
        });
    });

    context('when free access is on', () => {
        beforeEach(() => {
            cy.switchOnFreeAccess(true);
        });

        it('should load the license for the free access user and after each login state change', () => {
            // When I open the login page without logging in
            LoginSteps.visitInProdMode();
            // Then the license is requested
            cy.wait('@get-license');

            // When I log in
            HeaderSteps.login();
            LoginSteps.loginWithUser('admin', 'root');
            // Then the license is requested again
            cy.wait('@get-license');

            // When I log out
            HeaderSteps.logout();
            // Then the license is requested again for the free access user
            cy.wait('@get-license');
        });
    });
});
