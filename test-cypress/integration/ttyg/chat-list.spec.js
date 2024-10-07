import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {ApplicationSteps} from "../../steps/application-steps";
import HomeSteps from "../../steps/home-steps";
import {ChatPanelSteps} from "../../steps/ttyg/chat-panel-steps";

describe('TTYG chat list', () => {

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        cy.presetRepository('starwars');
    });

    it('Should render chat list', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-chat');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When the ttyg page is loaded
        // Then I should see the chat list
        // TODO: Temporary removed because it fails on CI.
        // TTYGViewSteps.getChatListLoadingIndicator().should('be.visible');
        TTYGViewSteps.getChatsPanel().should('be.visible');
        // And I should see 7 chat groups by day
        TTYGViewSteps.getChatByDayGroups().should('have.length', 2);
        // And the first chat group should have 3 chats
        verifyChatList([
            [
                {name: 'Test chat 3'},
                {name: 'Test chat 2'},
                {name: 'Very long chat name which does not fit in the sidebar'}
            ],
            [{name: 'Test chat 4'}]
        ]);
    });

    it('Should render no results when there are no chats', () => {
        TTYGStubs.stubChatsListGetNoResults();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When the ttyg page is loaded
        // And there are no chats
        // Then I expect chat list panel to be hidden
        TTYGViewSteps.getChatsPanel().should('be.hidden');
        // When I open the chat list
        TTYGViewSteps.expandChatsSidebar();
        // Then I should see no chats
        TTYGViewSteps.getChatByDayGroups().should('have.length', 0);
    });

    it('Should be able to edit an existing chat name by double click on the chat in the list', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatUpdate();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
        cy.wait('@get-chat');
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // And I double-click on the chat name I want to rename
        TTYGViewSteps.editChatName(1, 0);
        // Then I should see the chat name input
        TTYGViewSteps.getChatNameInput(1, 0).should('be.visible').and('have.value', 'Test chat 4');
        // When I change the chat name
        TTYGViewSteps.writeChatName(1, 0, 'New chat name');
        // And I hit [enter] key
        TTYGStubs.stubChatsListGet('/ttyg/chats/get-chat-list-with-renamed-chat.json');
        TTYGViewSteps.saveChatName(1, 0);
        // Then I should see the new chat name
        TTYGViewSteps.getChatFromGroup(1, 0).should('contain', 'New chat name');
    });

    // TODO: This test has quite hight failure rate on CI. Investigate and fix. Or move in the flaky tests suite.
    it.skip('Should be able to edit an existing chat name through the action menu', {
        retries: {
            runMode: 2,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatUpdate();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
        cy.wait('@get-chat');
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // And I open the action menu for the chat I want to rename
        TTYGViewSteps.selectChat(1, 0);
        TTYGViewSteps.triggerEditChatActionMenu(1, 0);
        // Then I should see the chat name input
        TTYGViewSteps.getChatNameInput(1, 0).should('be.visible').and('have.value', 'Test chat 4');
        // When I change the chat name
        TTYGViewSteps.writeChatName(1, 0, 'New chat name');
        // And I hit [enter] key
        TTYGStubs.stubChatsListGet('/ttyg/chats/get-chat-list-with-renamed-chat.json');
        TTYGViewSteps.saveChatName(1, 0);
        // Then I should see the new chat name
        TTYGViewSteps.getChatFromGroup(1, 0).should('contain', 'New chat name');
    });

    it('Should be able to cancel a chat name editing', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
        cy.wait('@get-chat');
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // And I double-click on the first chat
        TTYGViewSteps.editChatName(0, 0);
        // Then I should see the chat name input
        TTYGViewSteps.getChatNameInput(0, 0).should('be.visible').and('have.value', 'Test chat 3');
        // When I change the chat name
        TTYGViewSteps.writeChatName(0, 0, 'New chat name');
        // And I hit [esc] key
        TTYGViewSteps.cancelChatNameSaving(0, 0);
        // Then I should see the old chat name
        TTYGViewSteps.getChatFromGroup(0, 0).should('contain', 'Test chat 3');
    });

    it('Should be able to delete a chat', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatDelete();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
        cy.wait('@get-chat');
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I select the delete action from the chat action menu
        TTYGViewSteps.triggerDeleteChatActionMenu(1, 0);
        // Then I should see the chat deletion confirmation dialog
        ModalDialogSteps.getDialog().should('be.visible');
        // If I reject the deletion
        ModalDialogSteps.clickOnCancelButton();
        // Then the chat should not be deleted
        TTYGViewSteps.getChatFromGroup(1, 0).should('contain', 'Test chat 4');
        // When I select the delete action from the chat action menu again
        TTYGViewSteps.triggerDeleteChatActionMenu(1, 0);
        // And I confirm the deletion
        TTYGStubs.stubChatsListGet('/ttyg/chats/get-chat-list-with-deleted-chat.json');
        ModalDialogSteps.clickOnConfirmButton();
        // Then the chat should be deleted
        TTYGViewSteps.getChatByDayGroups().should('have.length', 1);

        // When I select a chat
        TTYGViewSteps.selectChat(0, 1);
        // Then I expect the chat be loaded
        TTYGViewSteps.getChatFromGroup(0, 0).should('contain', 'Test chat 3');
        TTYGViewSteps.getChatFromGroup(0, 0).should('have.class', 'selected');
        ChatPanelSteps.getChatDetailsElements().should('have.length', 2);

        // When I delete the selected chat
        TTYGViewSteps.triggerDeleteChatActionMenu(0, 1);
        ModalDialogSteps.clickOnConfirmButton();

        // Then I expect the chat history to be removed from the chat panel.
        ChatPanelSteps.getChatDetailsElements().should('have.length', 0);
    });

    it('Should be able to export chat from chat list export action', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatExport();
        TTYGStubs.stubChatGet();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
        cy.wait('@get-chat');
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When I select the export chat action chat panel toolbar
        TTYGViewSteps.triggerExportChatActionMenu(1, 0);
        cy.wait('@export-chat');
        // Then I expect to download the chat as a file
        TTYGViewSteps.verifyFileExists('chat-export.json');
    });

    it('Should show error notification if chat list fails to load', () => {
        TTYGStubs.stubChatListGetError();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        // When the chat list fails to load
        // Then I should see an error notification
        TTYGViewSteps.getChatListLoadingIndicator().should('not.exist');
        // And the error notification should be visible
        ApplicationSteps.getErrorNotifications().should('be.visible');
        // And the chat list should not be visible
        TTYGViewSteps.getChatsPanel().should('be.hidden');
    });

    it('Should persist selected chat', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-chat');
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-agent-list');
        TTYGViewSteps.getChatFromGroup(0, 0).should('have.class', 'selected');

        // When I select another chat,
        TTYGViewSteps.selectChat(0, 2);
        TTYGViewSteps.getChatFromGroup(0, 0).should('have.not.class', 'selected');
        TTYGViewSteps.getChatFromGroup(0, 2).should('have.class', 'selected');
        // change the page,
        HomeSteps.visit();
        cy.wait('@get-chat');
        // and came back to the ttyg page
        TTYGViewSteps.visit();

        // Then I expect to last used chat be selected.
        TTYGViewSteps.getChatFromGroup(0, 2).should('have.class', 'selected');
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
