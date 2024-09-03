import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";

describe('TTYG view', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'ttyg-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    it('Should load ttyg page and render main components', () => {
        TTYGStubs.stubChatsListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // Then I should see the ttyg view
        TTYGViewSteps.getTtygView().should('exist');
        TTYGViewSteps.getTtygViewTitle().should('contain', 'Talk to Your Graph');
        // Verify the chats sidebar
        TTYGViewSteps.getChatsPanel().should('be.visible');
        TTYGViewSteps.getToggleChatsSidebarButton().should('be.visible');
        // The create chat button is hidden by default when there are no chats
        TTYGViewSteps.getCreateChatButton().should('not.exist');
        // Verify the agents sidebar
        TTYGViewSteps.getAgentsPanel().should('be.visible');
        TTYGViewSteps.getHelpButton().should('be.visible');
        TTYGViewSteps.getCreateAgentButton().should('be.visible');
        TTYGViewSteps.getToggleAgentsSidebarButton().should('be.visible');
        // Verify the chat panel
        TTYGViewSteps.getChat().should('be.visible');
        TTYGViewSteps.getChatPanelToolbar().should('be.visible');
        TTYGViewSteps.getEditCurrentAgentButton().should('be.visible');
        TTYGViewSteps.getExportCurrentChatButton().should('be.visible');
    });
});

