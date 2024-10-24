import HomeSteps from '../../steps/home-steps';
import {EnvironmentStubs} from "../../stubs/environment-stubs";
import {SecurityStubs} from "../../stubs/security-stubs";
import {SettingsSteps} from "../../steps/setup/settings-steps";

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
        SettingsSteps.getCookiePolicyLink().should('exist').and('be.visible');

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
        SettingsSteps.getCookiePolicyLink().should('not.exist');
    });

    it('Should save consent in user settings', () => {
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();
        SecurityStubs.stubUpdateUserData('admin');

        // When I click Agree button
        HomeSteps.clickAgreeButton();

        // I expect to save cookie consent in user settings
        cy.wait('@updateUser').then((xhr) => {
            expect(xhr.request.body.appSettings).to.deep.eq({
                "DEFAULT_INFERENCE": true,
                "DEFAULT_VIS_GRAPH_SCHEMA": true,
                "DEFAULT_SAMEAS": true,
                "IGNORE_SHARED_QUERIES": false,
                "EXECUTE_COUNT": true,
                "COOKIE_CONSENT": true
            });
        });
    });
});
