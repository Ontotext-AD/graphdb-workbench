import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import HomeSteps from "../../steps/home-steps";

function verifyStateWithSelectedRepository() {
    TTYGViewSteps.getNoAgentsView().should('be.visible');
    TTYGViewSteps.getCreateFirstAgentButton().should('be.visible');
    TTYGViewSteps.getTtygInfoMessage().should('be.visible');
    TTYGViewSteps.getTtygagentMessage().should('be.visible');
    TTYGViewSteps.getApiKeyMessage().should('be.visible');
    TTYGViewSteps.getMissingApiKeyToastMessage()
        .should('be.visible')
        .and('contain', 'Set the config property graphdb.openai.api-key to your OpenAI API key');
}

describe('TTYG initial state with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'ttyg-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the TTYG page via URL with a repository selected
        TTYGViewSteps.visit();
        // Then,
        verifyStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the TTYG page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnTTYG();
        // Then,
        verifyStateWithSelectedRepository();
    });
});
