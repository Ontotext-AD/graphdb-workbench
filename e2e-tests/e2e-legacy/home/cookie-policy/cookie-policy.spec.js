import HomeSteps from '../../../steps/home-steps';
import {SecurityStubs} from '../../../stubs/security-stubs';
import {SettingsSteps} from '../../../steps/setup/settings-steps';
import {LicenseStubs} from '../../../stubs/license-stubs';
import {CookiePolicyModalSteps} from '../../../steps/cookie-policy/cookie-policy-modal.steps';
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {CookieConsentBannerSteps} from '../../../steps/cookie-policy/cookie-consent-banner-steps.js';

Cypress.env('set_default_user_data', false);

describe('Cookie policy', () => {
    beforeEach(() => {
        cy.setCookieConsent(undefined);
        cy.viewport(1280, 1000);
        LicenseStubs.stubFreeLicense();
    });

    afterEach(() => {
        cy.setCookieConsent(undefined);
    });

    it('should have default state when security is OFF', () => {
        // Given GDB security is OFF
        // When I open home page
        HomeSteps.visitInProdMode();
        // Then I expect to see cookie consent banner
        CookieConsentBannerSteps.getCookieConsentBanner().should('be.visible');
        // When I click on the cookie policy link in the banner
        CookieConsentBannerSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().and('be.visible');
        CookiePolicyModalSteps.getBody().should('be.visible');
        // And I expect to see that analytic and third party cookies are allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(true, true);
        // When I close the cookie policy modal
        CookiePolicyModalSteps.closeDialog();
        // Then I expect the cookie policy modal to be closed
        CookiePolicyModalSteps.getDialogComponent().should('not.exist');
        // When I open my settings page
        SettingsSteps.visitInProdMode();
        // Then I expect to see cookie policy button in My settings widget
        SettingsSteps.getCookiePolicyButton().and('be.visible');
        // When I click on the cookie policy button in My settings widget
        SettingsSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().and('be.visible');
        CookiePolicyModalSteps.getBody().should('be.visible');
        // And I expect to see that analytic and third party cookies are allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(true, true);
        // When I close the cookie policy modal
        CookiePolicyModalSteps.closeDialog();
        // Then I expect the cookie policy modal to be closed
        CookiePolicyModalSteps.getDialogComponent().should('not.exist');
    });

    it('should give consent for default cookie policy when security is OFF', () => {
        // Given GDB security is OFF
        // When I open home page
        HomeSteps.visitInProdMode();
        // Then I expect to see cookie consent banner
        CookieConsentBannerSteps.getCookieConsentBanner().should('be.visible');
        // When I click OK in the cookie consent banner
        SecurityStubs.spyOnUserUpdate('admin');
        CookieConsentBannerSteps.giveCookieConsent();
        // Then I expect to save cookie consent in user settings
        validateUserUpdateWithCookieConsent();
        // And I expect the banner to be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // And I expect GA tracking script to be added to the head
        validateGATracking();
        // When I open another page
        MainMenuSteps.clickOnMenuImport();
        cy.url().should('include', '/import');
        // Then I expect the banner to be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I reload the page
        cy.reload();
        // Then I expect the banner to be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
    });

    it('should update cookie policy and give consent when security is OFF', () => {
        // Given GDB security is OFF
        // When I open home page
        HomeSteps.visitInProdMode();
        // Then I expect to see cookie consent banner
        CookieConsentBannerSteps.getCookieConsentBanner().should('be.visible');
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
        // When I reopen the cookie policy dialog using the button in the banner
        CookieConsentBannerSteps.clickCookiePolicyLink();
        // And I expect to see that analytic cookies are not allowed and third party cookies are allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, true);
        // When I close the cookie policy dialog
        CookiePolicyModalSteps.closeDialog();
        // And I open my settings page
        MainMenuSteps.clickOnMySettings();
        // Then I expect to see cookie policy button in My settings widget
        SettingsSteps.getCookiePolicyButton().and('be.visible');
        // When I click on the cookie policy button in My settings widget
        SettingsSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        CookiePolicyModalSteps.getDialogComponent().should('be.visible');
        // And I expect to see that analytic cookies are not allowed and third party cookies are allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, true);
        // When I toggle off the third party cookies checkbox
        CookiePolicyModalSteps.toggleThirdPartyCookies();
        // And I close the cookie policy dialog
        CookiePolicyModalSteps.closeDialog();
        // When I reopen the cookie policy dialog using the button in my settings widget
        SettingsSteps.clickCookiePolicyLink();
        // And I expect to see that analytic cookies are not allowed and third party cookies are not allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, false);
        CookiePolicyModalSteps.closeDialog();
        // When I reload the page
        cy.reload();
        // And I reopen the cookie policy dialog using the button in my settings widget
        SettingsSteps.clickCookiePolicyLink();
        // And I expect to see that analytic cookies are not allowed and third party cookies are not allowed
        CookiePolicyModalSteps.validateCookiePolicyDialog(false, false);
        // When I close the cookie policy dialog
        CookiePolicyModalSteps.closeDialog();
        // And I click OK in the cookie consent banner
        CookieConsentBannerSteps.giveCookieConsent();
        // Then I expect the banner to be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
        // When I reload the page
        cy.reload();
        // Then I expect the banner to be hidden
        CookieConsentBannerSteps.getCookieConsentBanner().should('not.exist');
    });
});

function validateUserUpdateWithCookieConsent() {
    cy.wait('@updateUser').then((xhr) => {
        expect(xhr.request.body.appSettings).to.include({
            DEFAULT_INFERENCE: true,
            DEFAULT_VIS_GRAPH_SCHEMA: true,
            DEFAULT_SAMEAS: true,
            IGNORE_SHARED_QUERIES: false,
            EXECUTE_COUNT: true
        });

        // Assert COOKIE_CONSENT properties, excluding updatedAt
        expect(xhr.request.body.appSettings.COOKIE_CONSENT).to.include({
            policyAccepted: true
        });

        // Assert that updatedAt is present, is a number, and is a reasonable timestamp
        const updatedAt = xhr.request.body.appSettings.COOKIE_CONSENT.updatedAt;
        expect(updatedAt).to.exist;
        expect(updatedAt).to.be.a('number');

        // Check that updatedAt is within 1 hour of the current time
        const oneHourInMilliseconds = 60 * 60 * 1000;
        const now = Date.now();
        expect(updatedAt).to.be.within(now - oneHourInMilliseconds, now + oneHourInMilliseconds);
    });
}

function validateGATracking() {
    // Check if the GA tracking script is set correctly in the head
    cy.document()
        .get('head script')
        .should("have.attr", "src")
        .should('include', 'https://www.googletagmanager.com/gtm.js?id=GTM-WBP6C6Z4');

    // Check if the installation ID cookie is set correctly
    cy.getCookie('_wb').then((cookie) => {
        expect(cookie).to.exist;
        // Check the cookie structure: WB1.<installationId>.<timestamp>
        expect(cookie.value).to.match(/^WB1\.[a-zA-Z0-9\-]+\.\d+$/);
    });
}
