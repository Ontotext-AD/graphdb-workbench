import HomeSteps from '../../steps/home-steps';
import {EnvironmentStubs} from "../../stubs/environment-stubs";
import {SecurityStubs} from "../../stubs/security-stubs";
import {SettingsSteps} from "../../steps/setup/settings-steps";

Cypress.env('set_default_user_data', false);

describe('Cookie policy', () => {
    beforeEach(() => {
        cy.setDefaultUserData(false);
        cy.viewport(1280, 1000);
    });

    afterEach(() => cy.setDefaultUserData());

    it('Should show consent popup to user', () => {
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();
        HomeSteps.getCookieConsentPopup().should('exist').and('be.visible');
        // When I click on the link
        HomeSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        HomeSteps.getCookiePolicyModal().should('exist').and('be.visible');
    });

    it('Should show cookie policy to user in user settings', () => {
        SettingsSteps.visit();
        EnvironmentStubs.stubWbProdMode();
        SettingsSteps.getCookiePolicyButton().should('exist').and('be.visible');

        // When I click on the link
        SettingsSteps.clickCookiePolicyLink();
        // Then I see the cookie policy
        SettingsSteps.getCookiePolicyModal().should('exist').and('be.visible');
    });

    it('Should NOT show consent popup to user when tracking is not applicable', () => {
        HomeSteps.visit();
        HomeSteps.getCookieConsentPopup().should('not.exist');
    });

    it('Should NOT show cookie policy to user when tracking is not applicable', () => {
        SettingsSteps.visit();
        SettingsSteps.getCookiePolicyButton().should('not.exist');
    });

    it('Should save consent in user settings', () => {
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();
        SecurityStubs.stubUpdateUserData('admin');

        // When I click Agree button
        HomeSteps.clickAgreeButton();

        // I expect to save cookie consent in user settings
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
                policyAccepted: true,
                statistic: true,
                thirdParty: true
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
    });
});
