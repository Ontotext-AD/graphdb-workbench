import HomeSteps from '../../steps/home-steps';
import {EnvironmentStubs} from "../../stubs/environment-stubs";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {BrowserStubs} from "../../stubs/browser-stubs";

describe('Documentation links resolver', () => {

    beforeEach(() => {
        cy.viewport(1280, 1000);
        EnvironmentStubs.spyProductInfo();
    });

    it('Should link to master version when in dev mode', () => {
        HomeSteps.visit();
        waitForProductInfo();
        BrowserStubs.stubWindowOpen();
        EnvironmentStubs.stubWbDevMode();
        MainMenuSteps.clickOnMenuHelp();
        // Assert that links point to the master version
        assertDocumentationLinks('master');

    });

    it('Should link to master version when in prod mode and unofficial version', () => {
        EnvironmentStubs.stubProductInfo('10.8-TR1-test');
        HomeSteps.visit();
        waitForProductInfo();
        BrowserStubs.stubWindowOpen();
        EnvironmentStubs.stubWbProdMode();
        MainMenuSteps.clickOnMenuHelp();
        // Assert that links point to the master version
        assertDocumentationLinks('master');
    });

    it('Should link to GDB version when in prod mode and official version', () => {
        EnvironmentStubs.stubProductInfo('10.8');
        HomeSteps.visit();
        waitForProductInfo();
        BrowserStubs.stubWindowOpen();
        EnvironmentStubs.stubWbProdMode();
        MainMenuSteps.clickOnMenuHelp();
        // Assert that links point to the specific GDB version
        assertDocumentationLinks('10.8');
    });
});

function waitForProductInfo() {
    // We must wait for both requests, old legacy one and the new from the API
    cy.wait(EnvironmentStubs.PRODUCT_INFO_ALIAS());
    cy.wait(EnvironmentStubs.PRODUCT_INFO_ALIAS());
}

function assertDocumentationLinks(version) {
    const baseUrl = `https://graphdb.ontotext.com/documentation/${version}`;

    MainMenuSteps.clickOnSubMenu('Documentation')
    cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('have.been.calledWithMatch', `${baseUrl}/index.html`, "_blank")

    MainMenuSteps.clickOnSubMenu('Tutorials')
    cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('have.been.calledWithMatch', `${baseUrl}/tutorials.html`, "_blank")

    MainMenuSteps.clickOnSubMenu('Support')
    cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('have.been.calledWithMatch', `${baseUrl}/support.html`, "_blank")
}
