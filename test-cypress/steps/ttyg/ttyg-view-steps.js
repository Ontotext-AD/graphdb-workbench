export class TTYGViewSteps {
    static visit() {
        cy.visit('/chatgpt');
    }

    static getTtygView() {
        return cy.get('.ttyg-view');
    }

    static getTtygViewTitle() {
        return cy.get('#ttyg-view-title');
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
        return this.getAgentsSidebar().find('.agents-list-panel');
    }

    static getHelpButton() {
        return this.getAgentsSidebar().find('.help-btn');
    }

    static getCreateAgentButton() {
        return this.getAgentsSidebar().find('.create-agent-btn');
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

    static getExportCurrentChatButton() {
        return this.getChatPanelToolbar().find('.export-current-chat-btn');
    }

    static exportCurrentChat() {
        return this.getExportCurrentChatButton().click();
    }

    static getChat() {
        return this.getChatPanel().find('.chat');
    }
}
