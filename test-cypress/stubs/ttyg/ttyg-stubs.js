import {Stubs} from "../stubs";

export class TTYGStubs extends Stubs {
    static stubChatsListGet(fixture = '/ttyg/chats/get-chat-list.json', delay = 0) {
        cy.intercept('/rest/chat/conversations', {
            method: 'GET',
            fixture: fixture,
            statusCode: 200,
            delay: delay
        }).as('get-chat-list');
    }

    static stubChatListGetError() {
        cy.intercept('GET', '/rest/chat/conversations', {
            statusCode: 500,
            response: {
                error: 'Internal Server Error'
            }
        }).as('get-chat-list');
    }

    static stubChatsListGetNoResults() {
        cy.intercept('GET', '/rest/chat/conversations', {
            fixture: '/ttyg/chats/get-chat-list-0.json',
            statusCode: 200
        }).as('get-chat-list');
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
            cy.intercept('/rest/chat/conversations/*', (req) => {
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
        cy.intercept('PUT', '/rest/chat/conversations/*', {
            fixture: '/ttyg/chats/renamed-chat.json',
            statusCode: 200
        }).as('update-chat');
    }

    static stubChatDelete() {
        cy.intercept('DELETE', '/rest/chat/conversations/*', {
            fixture: '/ttyg/chats/deleted-chat.json',
            statusCode: 200
        }).as('delete-chat');
    }

    static stubChatExport() {
        cy.intercept('GET', '/rest/chat/conversations/export/*', {
            fixture: '/ttyg/chats/export-chat.json',
            statusCode: 200
        }).as('export-chat');
    }

    static stubAgentListGet(fixture = '/ttyg/agent/get-agent-list.json', delay = 0) {
        cy.intercept('GET', '/rest/chat/agents', {
            fixture: fixture,
            statusCode: 200,
            delay: delay
        }).as('get-agent-list');
    }

    static stubAgentListGetError() {
        cy.intercept('GET', '/rest/chat/agents', {
            statusCode: 500,
            response: {
                error: 'Internal Server Error'
            }
        }).as('get-agent-list-error');
    }

    static stubAgentCreate(delay = 0) {
        cy.intercept('POST', '/rest/chat/agents', {
            fixture: '/ttyg/agent/create-agent.json',
            statusCode: 200,
            delay: delay
        }).as('create-agent');
    }

    static stubAgentEdit() {
        cy.intercept({
            method: 'PUT',
            url: '/rest/chat/agents'
        }, (req) => {
            const requestBody = req.body;
            req.reply({
                statusCode: 200,
                body: requestBody
            });
        }).as('edit-agent');
    }

    static stubAgentDelete(delay = 0) {
        cy.intercept('DELETE','/rest/chat/agents/**', {
            statusCode: 200,
            delay: delay
        }).as('delete-agent');
    }

    static stubAgentDefaultsGet() {
        cy.intercept('GET', '/rest/chat/agents/default', {
            fixture: '/ttyg/agent/get-agent-defaults.json',
            statusCode: 200
        }).as('get-agent-defaults');
    }
}
