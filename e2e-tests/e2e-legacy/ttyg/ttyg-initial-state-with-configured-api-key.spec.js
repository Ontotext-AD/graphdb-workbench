import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import HomeSteps from "../../steps/home-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";

function verifyStateWithApiKey() {
    TTYGViewSteps.getChatListComponent().should('be.visible');
    TTYGViewSteps.getChatPanel().should('be.visible');
    TTYGViewSteps.getAgentsMenu().should('be.visible');
    TTYGViewSteps.getEditCurrentAgentButton().should('be.visible');
    TTYGViewSteps.getHelpButton().should('be.visible');
    TTYGViewSteps.getCreateAgentButton().should('be.visible');
    TTYGViewSteps.getToggleAgentsSidebarButton().should('be.visible');
}

describe('TTYG initial state with API key', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'ttyg-api-key-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the TTYG page via URL
        TTYGViewSteps.visit();
        // Then,
        verifyStateWithApiKey();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the TTYG page via the navigation menu
        HomeSteps.visit();
        MainMenuSteps.clickOnTTYG();
        // Then,
        verifyStateWithApiKey();
    });
});
