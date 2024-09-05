export class TTYGStubs {
    static stubChatsListGet(fixture = '/ttyg/chats/get-chat-list.json', delay = 0) {
        cy.intercept('/rest/chat/conversations', {
            method: 'GET',
            fixture: fixture,
            statusCode: 200,
            delay: delay
        }).as('get-chat-list');
    }

    static stubChatsListGetNoResults() {
        cy.intercept('/rest/chat/conversations', {
            method: 'GET',
            fixture: '/ttyg/chats/get-chat-list-0.json',
            statusCode: 200
        }).as('get-chat-list');
    }

    static stubChatCreate() {

    }

    static stubChatGet() {

    }

    static stubChatUpdate() {
        cy.intercept('/rest/chat/conversations/*', {
            method: 'PUT',
            fixture: '/ttyg/chats/renamed-chat.json',
            statusCode: 200
        }).as('update-chat');
    }

    static stubChatDelete() {
        cy.intercept('/rest/chat/conversations/*', {
            method: 'DELETE',
            fixture: '/ttyg/chats/deleted-chat.json',
            statusCode: 200
        }).as('delete-chat');
    }

    static stubAgentListGet(fixture = '/ttyg/agent/get-agent-list.json', delay = 0) {
        cy.intercept('/rest/chat/agents', {
            method: 'GET',
            fixture: fixture,
            statusCode: 200,
            delay: delay
        }).as('get-agent-list');
    }
}
