import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SparqlTemplatesSteps} from "../../../steps/setup/sparql-templates-steps";

describe('Sparql templates with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'similarity-index-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Sparql templates page via URL with a repository selected
        SparqlTemplatesSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Sparql templates page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSparqlTemplates();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        SparqlTemplatesSteps.getSparqlTemplatesPage().should('exist');
        SparqlTemplatesSteps.getSparqlTemplatesContent().should('be.visible');
        SparqlTemplatesSteps.getSparqlTemplatesCreateLink().should('be.visible');
        SparqlTemplatesSteps.getNoSparqlTemplatesMessage().should('be.visible');
    };
})
