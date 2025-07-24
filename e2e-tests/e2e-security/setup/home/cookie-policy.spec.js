import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {LicenseStubs} from "../../../stubs/license-stubs";
import {LoginSteps} from "../../../steps/login-steps";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";
import HomeSteps from "../../../steps/home-steps";

Cypress.env('set_default_user_data', false);

describe('Cookie policy', () => {

    let repository;

    beforeEach(() => {
        cy.loginAsAdmin().then(() => {
            cy.switchOffFreeAccess(true);
            cy.switchOffSecurity(true);
        });
        cy.setDefaultUserData(false);
        LicenseStubs.stubFreeLicense();
        repository = 'cypress-test-cookie-policy-security-' + Date.now();
        cy.createRepository({id: repository});
    });

    afterEach(() => {
        cy.deleteRepository(repository, true);
        cy.loginAsAdmin().then(() => {
            cy.switchOffFreeAccess(true);
            cy.switchOffSecurity(true);
            cy.setDefaultUserData();
        });
    });

    it('should show the consent popup if free access is on and the user is on the login page', () => {
        // Given: Security is enabled and free access is on
        UserAndAccessSteps.visitInProdMode();
        UserAndAccessSteps.toggleSecurity();
        LoginSteps.loginWithUser('admin', 'root');
        // And: Free access is enabled
        UserAndAccessSteps.getFreeAccessSwitchInput().should('not.be.checked');
        UserAndAccessSteps.toggleFreeAccess();
        UserAndAccessSteps.clickFreeWriteAccessRepo(repository);
        ModalDialogSteps.clickOKButton();

        // When: The user visits the login page
        LoginSteps.visitInProdMode();
        // Then: The cookie policy popup should be shown
        HomeSteps.getCookieConsentPopup().should('exist').and('be.visible');
    });

    it('should not show the consent popup if free access is off and the user is on the login page', () => {
        // Given: Security is enabled and free access is off
        UserAndAccessSteps.visitInProdMode();
        UserAndAccessSteps.toggleSecurity();
        LoginSteps.loginWithUser('admin', 'root');
        UserAndAccessSteps.getFreeAccessSwitchInput().should('not.be.checked');

        // When: The user logs out and visits the login page
        LoginSteps.logout();
        // Then: The cookie policy popup should not be shown
        HomeSteps.getCookieConsentPopup().should('not.exist');
        LoginSteps.visitInProdMode();
        HomeSteps.getCookieConsentPopup().should('not.exist');
    });
});
