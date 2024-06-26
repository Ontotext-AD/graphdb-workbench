import HomeSteps from '../../steps/home-steps';
import {EnvironmentStubs} from "../../stubs/environment-stubs";

describe('Documentation links resolver', () => {

    beforeEach(() => {
        cy.viewport(1280, 1000);
    });

    it('Should link to master version when in dev mode', () => {
        HomeSteps.visit();
        EnvironmentStubs.stubWbDevMode();
        HomeSteps.clickHelpMenu();
        // Assert that links point to the master version
        assertDocumentationLinks('master');
    });

    it('Should link to master version when in prod mode and unofficial version', () => {
        EnvironmentStubs.stubProductInfo('10.8-TR1-test');
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();
        HomeSteps.clickHelpMenu();
        // Assert that links point to the master version
        assertDocumentationLinks('master');
    });

    it('Should link to GDB version when in prod mode and official version', () => {
        EnvironmentStubs.stubProductInfo('10.8');
        HomeSteps.visit();
        EnvironmentStubs.stubWbProdMode();
        HomeSteps.clickHelpMenu();
        // Assert that links point to the specific GDB version
        assertDocumentationLinks('10.8');
    });
});

function assertDocumentationLinks(version) {
    const baseUrl = `https://graphdb.ontotext.com/documentation/${version}`;

    HomeSteps.getDocumentationLink()
        .should('exist')
        .and('be.visible')
        .find('a')
        .should('have.attr', 'href', `${baseUrl}/index.html`)
        .and('contain.text', 'Documentation');

    HomeSteps.getTutorialsLink()
        .should('exist')
        .and('be.visible')
        .find('a')
        .should('have.attr', 'href', `${baseUrl}/tutorials.html`)
        .and('contain.text', 'Tutorials');

    HomeSteps.getSupportLink()
        .should('exist')
        .and('be.visible')
        .find('a')
        .should('have.attr', 'href', `${baseUrl}/support.html`)
        .and('contain.text', 'Support');
}
