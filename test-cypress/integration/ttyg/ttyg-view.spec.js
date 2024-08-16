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
        TTYGViewSteps.getCreateChatButton().should('be.visible');
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

    it('Should render chat list', () => {
        TTYGStubs.stubChatsListGet(500);
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // Then I should see the chat list
        TTYGViewSteps.getChatListLoadingIndicator().should('be.visible');
        TTYGViewSteps.getChatsPanel().should('be.visible');
        // And I should see 7 chat groups by day
        TTYGViewSteps.getChatByDayGroups().should('have.length', 7);
        // And the first chat group should have 3 chats
        verifyChatList([
            [
                {name: 'Very long chat name which does not fit in the sidebar'},
                {name: 'Test chat 2'},
                {name: 'Test chat 3'}
            ],
            [{name: 'Test chat 4'}],
            [{name: 'Test chat 5'}],
            [{name: 'Test chat 6'}],
            [{name: 'Test chat 7'}],
            [{name: 'Test chat 8'}],
            [{name: 'Test chat 9'}]
        ]);
    });

    it('Should render no results when there are no chats', () => {
        TTYGStubs.stubChatsListGetNoResults();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // And there are no chats
        // Then I expect chat list panel to be hidden
        TTYGViewSteps.getChatsPanel().should('be.hidden');
        // When I open the chat list
        TTYGViewSteps.expandChatsSidebar();
        // Then I should see no chats
        TTYGViewSteps.getChatByDayGroups().should('have.length', 0);
    });
});

/**
 * @param {*[]} data
 */
function verifyChatList(data) {
    TTYGViewSteps.getChatByDayGroups().should('have.length', data.length);
    data.forEach((group, index) => {
        TTYGViewSteps.getChatsFromGroup(index).should('have.length', group.length);
        group.forEach((chat, chatIndex) => {
            TTYGViewSteps.getChatFromGroup(index, chatIndex).should('contain', chat.name);
        });
    });
}
