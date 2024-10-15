export class TTYGViewSteps {
    static visit() {
        cy.visit('/ttyg');
    }

    static getTtygView() {
        return cy.get('.ttyg-view');
    }

    static getTtygViewTitle() {
        return cy.get('#ttyg-view-title');
    }

    static getNoAgentsView() {
        return this.getTtygView().find('.no-agents-view-component');
    }

    static getTtygViewContent() {
        return cy.get('.ttyg-view-content');
    }

    static getChatsSidebar() {
        return cy.get('.left-sidebar');
    }

    static getChatListLoadingIndicator() {
        return this.getChatsSidebar().find('[onto-loader-fancy]');
    }

    static getChatsPanel() {
        return this.getChatsSidebar().find('.chat-list-panel');
    }

    static getChatListComponent() {
        return this.getChatsPanel().find('.chat-list-component');
    }

    static getChatByDayGroups() {
        return this.getChatListComponent().find('.chat-group');
    }

    static getChatGroup(index) {
        return this.getChatByDayGroups().eq(index);
    }

    static getChatsFromGroup(index) {
        return this.getChatGroup(index).find('.chat-item');
    }

    static getChatFromGroup(groupIndex, chatIndex) {
        return this.getChatGroup(groupIndex).find('.chat-item').eq(chatIndex);
    }

    static selectChat(groupIndex, chatIndex) {
        this.getChatFromGroup(groupIndex, chatIndex).click();
    }

    static editChatName(groupIndex, chatIndex) {
        this.getChatFromGroup(groupIndex, chatIndex).dblclick();
    }

    static getChatNameInput(groupIndex, chatIndex) {
        return this.getChatFromGroup(groupIndex, chatIndex).find('.inline-editable-text input');
    }

    static writeChatName(groupIndex, chatIndex, name) {
        this.getChatNameInput(groupIndex, chatIndex).clear().type(name);
    }

    static saveChatName(groupIndex, chatIndex) {
        this.getChatNameInput(groupIndex, chatIndex).type('{enter}');
    }

    static cancelChatNameSaving(groupIndex, chatIndex) {
        this.getChatNameInput(groupIndex, chatIndex).type('{esc}');
    }

    static openChatActionMenu(groupIndex, chatIndex) {
        this.getChatFromGroup(groupIndex, chatIndex).realHover().find('.open-chat-actions-btn').click();
    }

    static triggerEditChatActionMenu(groupIndex, chatIndex) {
        this.openChatActionMenu(groupIndex, chatIndex);
        this.getChatFromGroup(groupIndex, chatIndex).find('.chat-actions-menu .rename-chat-btn').click();
    }

    static triggerDeleteChatActionMenu(groupIndex, chatIndex) {
        this.openChatActionMenu(groupIndex, chatIndex);
        this.getChatFromGroup(groupIndex, chatIndex).find('.chat-actions-menu .delete-chat-btn').click();
    }

    static triggerExportChatActionMenu(groupIndex, chatIndex) {
        this.openChatActionMenu(groupIndex, chatIndex);
        this.getChatFromGroup(groupIndex, chatIndex).find('.chat-actions-menu .export-chat-btn').click();
    }

    static getToggleChatsSidebarButton() {
        return this.getChatsSidebar().find('.toggle-chats-sidebar-btn');
    }

    static collapseChatsSidebar() {
        return this.getToggleChatsSidebarButton().click();
    }

    static expandChatsSidebar() {
        return this.getToggleChatsSidebarButton().click();
    }

    static getCreateChatButton() {
        return this.getChatsSidebar().find('.create-chat-btn');
    }

    static getAgentsSidebar() {
        return cy.get('.right-sidebar');
    }

    static getAgentsPanel() {
        return this.getAgentsSidebar().find('.agent-list-panel');
    }

    static getAgentFilter() {
        return this.getAgentsPanel().find('.agents-filter-dropdown');
    }

    static getSelectedAgentFilter() {
        return this.getAgentFilter().find('.selected-filter');
    }

    static getDropdownMenu() {
        return this.getAgentFilter().find('.dropdown-menu');
    }

    static verifyRepositoryOptionNotExist(repositoryId) {
        this.getDropdownMenu().each(($select) => {
            cy.wrap($select).should('not.contain.text', repositoryId);
        });
    }

    static filterAgentsByRepository(repository) {
        this.getAgentFilter().click();
        this.getDropdownMenu().find(`[data-value="${repository}"]`).click();
    }

    static selectAllAgentsFilter() {
        this.filterAgentsByRepository('All');
    }

    static getAgentsLoadingIndicator() {
        return this.getAgentsPanel().find('.agent-list-loader');
    }

    static getAgents() {
        return this.getAgentsPanel().find('.agent-item');
    }

    static getAgent(index) {
        return this.getAgents().eq(index);
    }

    static getHelpButton() {
        return this.getAgentsSidebar().find('.help-btn');
    }

    static getCreateFirstAgentButton() {
        return this.getNoAgentsView().find('.create-agent-btn');
    }

    static getCreateAgentButton() {
        return this.getAgentsSidebar().find('.create-agent-btn');
    }

    static createFirstAgent() {
        this.getCreateFirstAgentButton().click();
    }

    static getToggleAgentsSidebarButton() {
        return this.getAgentsSidebar().find('.toggle-agents-sidebar-btn');
    }

    static collapseAgentsSidebar() {
        return this.getToggleAgentsSidebarButton().click();
    }

    static expandAgentsSidebar() {
        return this.getToggleAgentsSidebarButton().click();
    }

    static getChatPanel() {
        return this.getTtygView().find('.chat-content');
    }

    static getChatPanelToolbar() {
        return this.getChatPanel().find('.toolbar');
    }

    static getEditCurrentAgentButton() {
        return this.getChatPanelToolbar().find('.edit-current-agent-btn');
    }

    static editCurrentAgent() {
        return this.getEditCurrentAgentButton().click();
    }

    static verifyFileExists(fileName) {
        cy.readFile('cypress/downloads/' + fileName);
    }

    static getChat() {
        return this.getChatPanel().find('.chat');
    }

    static getOpenAgentActionsButton(index) {
        return this.getAgent(index).realHover().find('.open-agent-actions-btn');
    }

    static openAgentActionMenu(index) {
        this.getOpenAgentActionsButton.click();
    }

    static triggerCloneAgentActionMenu(index) {
        this.openAgentActionMenu(index);
        this.getAgent(index).find('.agent-actions-menu .clone-agent-btn').click();
    }

    static triggerDeleteAgentActionMenu(index) {
        this.openAgentActionMenu(index);
        this.getAgent(index).find('.agent-actions-menu .delete-agent-btn').click();
    }

    static getAgentDeletingLoader() {
        return this.getAgentsPanel().find('.agent-list .deleting-agent-loader');
    }

    /**
     * @param {*[]} data
     */
    static verifyAgentList(data) {
        this.getAgents().should('have.length', data.length);
        data.forEach((agent, index) => {
            this.getAgent(index).within(() => {
                cy.get('.agent-name').should('contain', agent.name);
                cy.get('.related-repository').should('contain', agent.repositoryId);
            });
        });
    }

    static getAgentsMenu() {
        return this.getTtygView().find('.agent-select-menu');
    }

    static getAgentsMenuToggleButton() {
        return this.getAgentsMenu().find('.dropdown-toggle-btn');
    }

    static openAgentsMenu() {
        this.getAgentsMenuToggleButton().click();
    }

    static getAgentsFromMenu() {
        return this.getAgentsMenu().find('.agent-menu-item');
    }

    static getAgentFromMenu(index) {
        return this.getAgentsFromMenu().eq(index);
    }

    static selectAgent(index) {
        this.getAgentFromMenu(index).click();
    }

    static verifySelectAgentMenuItems(data) {
        this.openAgentsMenu();
        this.getAgentsFromMenu().should('have.length', data.length);
        data.forEach((agent, index) => {
            this.getAgentFromMenu(index).within(() => {
                cy.get('.agent-name').should('contain', agent.name);
                cy.get('.repository-id').should('contain', agent.repositoryId);
            });
        });
    }

    static getExplainResponseButton(index) {
        return this.getTtygView().find('.explain-response-btn').eq(index);
    }

    static clickOnExplainResponse(index) {
        this.getExplainResponseButton(index).click();
    }

    static getHowDeliverAnswerButton() {
        return this.getTtygView().find('.deliver-answer-btn');
    }

    static clickOnHowDeliverAnswerButton(index) {
        this.getHowDeliverAnswerButton().click();
    }

    static getExplainResponsesElement(index) {
        return cy.get('.explain-responses').eq(index);
    }

    static getExplainResponseElement(explainResponsesIndex, explainResponseIndex) {
        return this.getExplainResponsesElement(explainResponsesIndex).find('.explain-response').eq(explainResponseIndex);
    }

    static getQueryMethodElement(explainResponsesIndex, explainResponseIndex) {
        return this.getExplainResponseElement(explainResponsesIndex, explainResponseIndex).find('.query-method');
    }

    static getQueryMethodDetailsElement(explainResponsesIndex, explainResponseIndex) {
        return this.getExplainResponseElement(explainResponsesIndex, explainResponseIndex).find('.query-method-details');
    }

    static getRawQuery(explainResponsesIndex, explainResponseIndex) {
        return this.getExplainResponseElement(explainResponsesIndex, explainResponseIndex).find('.raw-query');
    }

    static getExplainQueryHeaderElement(explainResponsesIndex, explainResponseIndex) {
        return this.getExplainResponseElement(explainResponsesIndex, explainResponseIndex).find('.header');
    }

    static getExplainQueryQueryElement(explainResponsesIndex, explainResponseIndex) {
        return this.getExplainResponseElement(explainResponsesIndex, explainResponseIndex).find('.query');
    }
}
