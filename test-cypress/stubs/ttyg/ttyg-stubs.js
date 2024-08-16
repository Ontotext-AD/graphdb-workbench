export class TTYGStubs {
    static stubChatsListGet(delay = 0) {
        cy.intercept('/rest/chat/conversations', {
            method: 'GET',
            fixture: '/ttyg/chats/get-chat-list.json',
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

    }

    static stubChatDelete() {

    }
}
