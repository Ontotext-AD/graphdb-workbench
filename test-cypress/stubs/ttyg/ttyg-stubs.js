import {Stubs} from "../stubs";

export class TTYGStubs extends Stubs {
    static stubChatsListGet(fixture = '/ttyg/chats/get-chat-list.json', delay = 0) {
        cy.intercept('GET', '/rest/chat/conversations', {
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
     * @param {number} delay - Optional delay in milliseconds before responding with the fixture.
     */
    static stubChatGet(delay = 0) {
        cy.fixture('/ttyg/chats/get-chat.json').then((body) => {
            cy.intercept({
                method: 'GET',
                url: '/rest/chat/conversations/*'
            }, (req) => {
                const chatId = req.url.split('/').pop();
                const chat = body[chatId];
                // Respond with the modified body
                req.reply({
                    statusCode: 200,
                    body: JSON.stringify(chat),
                    delay: delay
                });
            }).as('get-chat');
        });
    }

    static stubChatGet404Error() {
        cy.intercept('GET', '/rest/chat/conversations/*', {
            statusCode: 404,
            response: {
                error: 'Not Found'
            }
        }).as('get-chat');
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

    static stubAgentListWithIncompatibleGet(delay = 0) {
        this.stubAgentListGet('/ttyg/agent/get-agent-list-with-incompatible-agents.json');
    }

    static stubAgentGet(fixture = '/ttyg/agent/get-agent.json', delay = 0) {
        cy.intercept('GET', '/rest/chat/agents/*', {
            fixture: fixture,
            statusCode: 200,
            delay: delay
        }).as('get-agent');
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
        cy.intercept('DELETE', '/rest/chat/agents/**', {
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

    static stubAnswerQuestion(fixture = '/ttyg/chats/ask-question.json') {
        cy.intercept('POST', '/rest/chat/conversations', {
            fixture,
            statusCode: 200
        }).as('get-agent-defaults');
    }

    static stubCrateNewChat(fixture = 'ttyg/chats/create/create-chat-response.json') {
        cy.fixture(fixture).then((fixtureData) => {
            const today = Math.floor(Date.now() / 1000) + '';
            const body = JSON.stringify(fixtureData).replace(/"creationDate"/g, today);
            cy.intercept('POST', '/rest/chat/conversations', {
                statusCode: 200,
                body: JSON.parse(body)
            }).as('create-chat');
        });

    }

    static stubExplainResponse(fixture = '/ttyg/chats/explain-response-1.json') {
        cy.intercept('POST', 'rest/chat/conversations/explain', {
            fixture,
            statusCode: 200
        }).as('explain-response');
    }
}
