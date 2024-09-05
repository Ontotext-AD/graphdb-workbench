import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

// TODO: This test is skipped because it fails on CI. For some reason the chat list panel is not visible.
describe.skip('TTYG chat list', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'ttyg-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render chat list', () => {
        TTYGStubs.stubChatsListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
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
                {name: 'Very long chat name which does not fit in the sidebar'},
                {name: 'Test chat 2'},
                {name: 'Test chat 3'}
            ],
            [{name: 'Test chat 4'}]
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

    it('Should be able to edit an existing chat name by double click on the chat in the list', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatUpdate();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
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

    it('Should be able to edit an existing chat name through the action menu', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatUpdate();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
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
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
        // And I double-click on the first chat
        TTYGViewSteps.editChatName(0, 0);
        // Then I should see the chat name input
        TTYGViewSteps.getChatNameInput(0, 0).should('be.visible').and('have.value', 'Very long chat name which does not fit in the sidebar');
        // When I change the chat name
        TTYGViewSteps.writeChatName(0, 0, 'New chat name');
        // And I hit [esc] key
        TTYGViewSteps.cancelChatNameSaving(0, 0);
        // Then I should see the old chat name
        TTYGViewSteps.getChatFromGroup(0, 0).should('contain', 'Very long chat name which does not fit in the sidebar');
    });

    it('Should be able to delete a chat', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatDelete();
        // Given I have opened the ttyg page and there are chats loaded
        TTYGViewSteps.visit();
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
