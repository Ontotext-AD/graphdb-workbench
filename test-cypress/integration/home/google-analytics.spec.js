import HomeSteps from '../../steps/home-steps';
import {LicenseStubs} from "../../stubs/license-stubs";
import {EnvironmentStubs} from "../../stubs/environment-stubs";

describe('Google analytics', () => {

    beforeEach(() => {
        cy.viewport(1280, 1000);
    });

    // Note: Google API calls are stubbed for all specs in support/index.js
    it('Should set GA tracking code in header and a cookie when free license and prodMode', () => {
        LicenseStubs.stubFreeLicense();
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();

        cy.document()
            .get('head script')
            .should("have.attr", "src")
            .should('include', 'https://www.googletagmanager.com/gtm.js?id=GTM-WBP6C6Z4');

        // Check if the installation ID cookie is set correctly
        cy.getCookie('_wb').then((cookie) => {
            expect(cookie).to.exist;
            expect(cookie.value).to.match(/^WB1\.[a-zA-Z0-9\-]+\.\d+$/); // Check the cookie structure: WB1.<installationId>.<timestamp>
        });
    });

    it('Should set GA tracking code in header and cookie when evaluation enterprise license and prodMode', () => {
        LicenseStubs.stubEvaluationLicense();
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();

        cy.document()
            .get('head script')
            .should("have.attr", "src")
            .should('include', 'https://www.googletagmanager.com/gtm.js?id=GTM-WBP6C6Z4');

        // Check if the installation ID cookie is set correctly
        cy.getCookie('_wb').then((cookie) => {
            expect(cookie).to.exist;
            expect(cookie.value).to.match(/^WB1\.[a-zA-Z0-9\-]+\.\d+$/); // Check the cookie structure: WB1.<installationId>.<timestamp>
        });
    });

    it('Should NOT set GA tracking code in header and cookie when enterprise license in prodMode', () => {
        LicenseStubs.stubEnterpriseLicense();
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();

        cy.document()
            .get('head script')
            .should("not.have.attr", "src");

        // Check if the installation ID cookie is set correctly
        cy.getCookie('_wb').then((cookie) => {
            expect(cookie).to.not.exist;
        });
    });
});
