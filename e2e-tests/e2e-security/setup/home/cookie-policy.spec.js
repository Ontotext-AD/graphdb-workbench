import {UserAndAccessSteps} from "../../../steps/setup/user-and-access-steps";
import {LicenseStubs} from "../../../stubs/license-stubs";
import {LoginSteps} from "../../../steps/login-steps";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {CookieConsentBannerSteps} from '../../../steps/cookie-policy/cookie-consent-banner-steps.js';
import ImportSteps from '../../../steps/import/import-steps.js';
import {CookiePolicyModalSteps} from '../../../steps/cookie-policy/cookie-policy-modal.steps.js';
import {SettingsSteps} from '../../../steps/setup/settings-steps.js';
import {HeaderSteps} from '../../../steps/header-steps.js';

Cypress.env('set_default_user_data', false);

describe('Cookie policy', () => {

    let repository;

    beforeEach(() => {
        cy.loginAsAdmin().then(() => {
            cy.switchOffFreeAccess(true);
            cy.switchOffSecurity(true);
        });
        cy.setDefaultUserData(undefined);
        LicenseStubs.stubFreeLicense();
        repository = 'cypress-test-cookie-policy-security-' + Date.now();
        cy.createRepository({id: repository});
    });

    afterEach(() => {
        cy.deleteRepository(repository, true);
        cy.loginAsAdmin().then(() => {
            cy.switchOffFreeAccess(true);
            cy.switchOffSecurity(true);
            cy.setDefaultUserData(undefined);
        });
    });

    // Scenario 5
    it('should hide cookie consent banner when security is ON and user is logged out', () => {
        // Given I open user and access page in prod mode
        UserAndAccessSteps.visitInProdMode();
        // Then the cookie policy banner should be visible
        CookieConsentBannerSteps.getCookieConsentBanner().should('exist').and('be.visible');
        // When I enable security
        UserAndAccessSteps.toggleSecurity();
        // Then I should be logged out
        LoginSteps.getLoginPage().should('be.visible');
        // And the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I login with admin
        LoginSteps.loginWithUser('admin', 'root');
        // Then the cookie policy banner should be visible
        UserAndAccessSteps.getUsersTable().should('be.visible');
        CookieConsentBannerSteps.getCookieConsentBanner().should('exist').and('be.visible');
    });

    // Scenario 6
    it('should give cookie consent when security is ON', () => {
        // Given I open user and access page in prod mode
        UserAndAccessSteps.visitInProdMode();
        // When I enable security
        UserAndAccessSteps.toggleSecurity();
        // Then I should be logged out
        LoginSteps.getLoginPage().should('be.visible');
        // When I login with admin
        LoginSteps.loginWithUser('admin', 'root');
        // Then I should see the users and access page
        UserAndAccessSteps.getUsersTable().should('be.visible');
        // Then the cookie policy banner should be visible
        CookieConsentBannerSteps.getCookieConsentBanner().should('be.visible');
        // When I click OK in the cookie consent banner
        CookieConsentBannerSteps.giveCookieConsent();
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I open another page
        MainMenuSteps.clickOnMenuImport();
        ImportSteps.getView().should('be.visible');
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I reload the page
        cy.reload();
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
    });

    // Scenario 7
    it('should update cookie policy and give cookie consent when security is ON', () => {
        // Given I open user and access page in prod mode
        UserAndAccessSteps.visitInProdMode();
        // And I enable security
        UserAndAccessSteps.toggleSecurity();
        // And I login with admin
        LoginSteps.loginWithUser('admin', 'root');
        // When I click on the cookie policy link in the banner
        CookieConsentBannerSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().should('be.visible');
        CookiePolicyModalSteps.validateCookiePolicyDialog(true, true);
        // When I toggle off the analytics cookie checkbox
        CookiePolicyModalSteps.toggleStatisticCookies();
        // And I close the dialog
        CookiePolicyModalSteps.closeDialog();
        CookiePolicyModalSteps.getDialog().should('not.exist');
        // When I reload the page
        cy.reload();
        // Then I expect to see that analytic cookies are not allowed and third party cookies are allowed
        CookieConsentBannerSteps.clickCookiePolicyLink();
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, true);
        // And I close the cookie policy dialog
        CookiePolicyModalSteps.closeDialog();
        // When I open my settings page
        MainMenuSteps.clickOnMySettings();
        // And I open cookie policy modal using the button in the my settings widget
        SettingsSteps.clickCookiePolicyLink();
        // Then I should see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().should('be.visible');
        // And I expect to see that analytic cookies are not allowed and third party cookies are allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, true);
        // When I toggle off third party cookies checkbox
        CookiePolicyModalSteps.toggleThirdPartyCookies();
        // And I close the modal
        CookiePolicyModalSteps.closeDialog();
        // When I reopen modal from the widget
        SettingsSteps.clickCookiePolicyLink();
        // Then I expect to see that analytic cookies are not allowed and third party cookies are not allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, false);
        CookiePolicyModalSteps.closeDialog();
        // When I click OK in the banner
        CookieConsentBannerSteps.giveCookieConsent();
        // Then I expect the banner to be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I reload the page
        cy.reload();
        // Then I expect the banner to be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I logout
        LoginSteps.logout();
        // Then I should see the login page
        LoginSteps.getLoginPage().should('be.visible');
        // And the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I login with admin
        LoginSteps.loginWithUser('admin', 'root');
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I open cookie policy modal from the widget
        SettingsSteps.clickCookiePolicyLink();
        // Then I expect to see that analytic cookies are not allowed and third party cookies are not allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, false);
        // When I toggle on third party cookies checkbox
        CookiePolicyModalSteps.toggleThirdPartyCookies();
        // And I close the modal
        CookiePolicyModalSteps.closeDialog();
        // When I reload the page
        cy.reload();
        // Then I expect to see that analytic cookies are not allowed and third party cookies are allowed
        SettingsSteps.clickCookiePolicyLink();
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, true);
    });

    // Scenario 8
    it('should update cookie policy and give cookie consent when security is ON and free access is ON', () => {
        // Given I open user and access page in prod mode
        UserAndAccessSteps.visitInProdMode();
        // And I enable security
        UserAndAccessSteps.toggleSecurity();
        // And I login with admin
        LoginSteps.loginWithUser('admin', 'root');
        // And I enable free access
        UserAndAccessSteps.toggleFreeAccess();
        UserAndAccessSteps.clickFreeWriteAccessRepo(repository);
        ModalDialogSteps.clickOKButton();
        // Then the cookie policy banner should be visible
        CookieConsentBannerSteps.getCookieConsentBanner().and('be.visible');
        // When I click on the cookie policy link in the banner
        CookieConsentBannerSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().should('be.visible');
        // And I expect to see that analytic and third party cookies are allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(true, true);
        // When I toggle off the analytics cookie checkbox
        // The policy is saved on the server
        CookiePolicyModalSteps.toggleStatisticCookies();
        // And I close the dialog
        CookiePolicyModalSteps.closeDialog();
        CookiePolicyModalSteps.getDialog().should('not.exist');
        // When I logout
        HeaderSteps.logout();
        // Then I should still see the user and access page but I have no access to it which is unimportant for this test
        cy.url().should('include', '/users');
        // And the cookie policy banner should be visible
        CookieConsentBannerSteps.getCookieConsentBanner().and('be.visible');
        // When I click on the cookie policy link in the banner
        CookieConsentBannerSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().should('be.visible');
        // And I expect to see that analytic cookies are allowed and third party cookies are allowed
        // (using browser data, because user is logged out)
        CookiePolicyModalSteps.validateCookiePolicyDialog(true, true);
        // And I close the cookie policy modal
        CookiePolicyModalSteps.closeDialog();
        // When I open another page
        MainMenuSteps.clickOnMenuImport();
        // Then the cookie policy banner should be visible
        CookieConsentBannerSteps.getCookieConsentBanner().and('be.visible');
        // When I give cookie consent
        CookieConsentBannerSteps.giveCookieConsent();
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I open another page
        MainMenuSteps.clickOnSparqlMenu();
        cy.url().should('include', '/sparql');
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I reload the page
        cy.reload();
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I login with admin
        HeaderSteps.login();
        LoginSteps.loginWithUser('admin', 'root');
        cy.url().should('include', '/sparql');
        // Then the cookie policy banner should be visible (because consent is saved on the server, but user has no changes persisted on server, so defaults are considered)
        CookieConsentBannerSteps.getCookieConsentBanner().and('be.visible');
        // When I click on the cookie policy link in the banner
        CookieConsentBannerSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().should('be.visible');
        // And I expect to see that analytic cookies are allowed and third party cookies are allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, true);
        // When I toggle off third party cookies checkbox
        CookiePolicyModalSteps.toggleThirdPartyCookies();
        // And I close the modal
        CookiePolicyModalSteps.closeDialog();
        // When I reopen modal from the banner button
        CookieConsentBannerSteps.clickCookiePolicyLink();
        // Then I expect to see that analytic cookies are allowed and third party cookies are not allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, false);
        CookiePolicyModalSteps.closeDialog();
        // When I logout
        HeaderSteps.logout();
        // And the cookie policy banner should be hidden (using browser data)
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I login with admin
        HeaderSteps.login();
        LoginSteps.loginWithUser('admin', 'root');
        // Then the cookie policy banner should be visible (consent is persisted with the user on server)
        CookieConsentBannerSteps.getCookieConsentBanner().should('be.visible');
        // When I give cookie consent
        CookieConsentBannerSteps.giveCookieConsent();
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I reload the page
        cy.reload();
        // Then the cookie policy banner should be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
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
        CookieConsentBannerSteps.getCookieConsentBanner().should('exist').and('be.visible');
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
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        LoginSteps.visitInProdMode();
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
    });
});
