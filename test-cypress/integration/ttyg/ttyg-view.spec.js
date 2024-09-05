import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";

describe('TTYG view', () => {

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        cy.presetRepository('starwars');
    });

    it('Should load ttyg page and render main components', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
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

    it('Should render no agents view if no agent is created yet', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // Then I should see the ttyg view
        TTYGViewSteps.getTtygView().should('exist');
        // And the no agents view should be rendered
        TTYGViewSteps.getNoAgentsView().should('be.visible');
        // And the create agent button should be visible
        TTYGViewSteps.getCreateFirstAgentButton().should('be.visible');
    });
});

