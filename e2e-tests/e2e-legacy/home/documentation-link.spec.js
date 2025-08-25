import HomeSteps from '../../steps/home-steps';
import {EnvironmentStubs} from "../../stubs/environment-stubs";
import {MainMenuSteps} from "../../steps/main-menu-steps";

describe('Documentation links resolver', () => {

    beforeEach(() => {
        cy.viewport(1280, 1000);
        EnvironmentStubs.spyProductInfo();
    });

    it('Should link to master version when in dev mode', () => {
        HomeSteps.visitInDevMode();
        MainMenuSteps.clickOnMenuHelp();
        // Assert that links point to the master version
        MainMenuSteps.getSubMenuButtonByName('Documentation').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/master/index.html');
        MainMenuSteps.getSubMenuButtonByName('Tutorials').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/master/tutorials.html');
        MainMenuSteps.getSubMenuButtonByName('Support').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/master/support.html');
    });

    it('Should link to master version when in prod mode and unofficial version', () => {
        EnvironmentStubs.stubProductInfo('10.8-TR1-test');
        HomeSteps.visitInProdMode();
        MainMenuSteps.clickOnMenuHelp();
        // Assert that links point to the master version
        MainMenuSteps.getSubMenuButtonByName('Documentation').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/master/index.html');
        MainMenuSteps.getSubMenuButtonByName('Tutorials').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/master/tutorials.html');
        MainMenuSteps.getSubMenuButtonByName('Support').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/master/support.html');
    });

    it('Should link to GDB version when in prod mode and official version', () => {
        EnvironmentStubs.stubProductInfo('10.8');
        HomeSteps.visitInProdMode();
        MainMenuSteps.clickOnMenuHelp();
        // Assert that links point to the specific GDB version
        MainMenuSteps.getSubMenuButtonByName('Documentation').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/10.8/index.html');
        MainMenuSteps.getSubMenuButtonByName('Tutorials').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/10.8/tutorials.html');
        MainMenuSteps.getSubMenuButtonByName('Support').should('have.attr', 'href').and('include', 'https://graphdb.ontotext.com/documentation/10.8/support.html');
    });
});

