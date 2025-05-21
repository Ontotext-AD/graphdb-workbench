import SparqlSteps from "../../steps/sparql-steps";
import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";

describe('SPARQL page with selected repository', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-page-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render SPARQL page with editor via URL', () => {
        // Given, I visit the SPARQL page via URL, and I have a selected repository
        SparqlSteps.visit();
        // Then, I expect to see the editor
        SparqlSteps.getQueryArea().should('be.visible');
    });

    it('Should render SPARQL page with editor via navigation menu', () => {
        // Given I open the SPARQL page, via navigation through the home page, and I have a selected repository
        HomeSteps.visit();
        MainMenuSteps.clickOnSparqlMenu();
        // Then, I expect to see the editor
        SparqlSteps.getQueryArea().should('be.visible');
    });
})
