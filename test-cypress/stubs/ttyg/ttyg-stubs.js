export class TTYGStubs {
    static stubChatsListGet(fixture = '/ttyg/chats/get-chat-list.json', delay = 0) {
        cy.intercept('/rest/chat/conversations', {
            method: 'GET',
            fixture: fixture,
            statusCode: 200,
            delay: delay
        }).as('get-chat-list');
    }

    static stubChatListGetError() {
        cy.intercept('/rest/chat/conversations', {
            method: 'GET',
            statusCode: 500,
            response: {
                error: 'Internal Server Error'
            }
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

    /**
     * Loads the specified <code>fixture</code> and updates the chatId in the fixture with the actual ID passed in the endpoint call.
     *
     * @param {string} fixture - Path to the JSON file containing the chat conversation.
     * @param {number} delay - Optional delay in milliseconds before responding with the fixture.
     */
    static stubChatGet(fixture = '/ttyg/chats/get-chat-1.json', delay = 0) {
        cy.fixture(fixture).then((body) => {
            const bodyString = JSON.stringify(body);
            cy.intercept('/rest/chat/conversations/**', (req) => {
                const chatId = req.url.split('/').pop();
                    // Respond with the modified body
                    req.reply({
                        statusCode: 200,
                        body: bodyString.replace(/{chatId}/g, chatId),
                        delay: delay
                    });
            }).as('get-chat');
        });
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

    static stubAgentListGetError() {
        cy.intercept('/rest/chat/agents', {
            method: 'GET',
            statusCode: 500,
            response: {
                error: 'Internal Server Error'
            }
        }).as('get-agent-list');
    }
}
