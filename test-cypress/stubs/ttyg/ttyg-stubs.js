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
     * @param {string} fixture - Path to the JSON file containing the chat conversation.
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

    static stubAnswerQuestion() {
        cy.intercept({
            method: 'POST',
            url: '/rest/chat/conversations'
        }, (req) => {
            const requestBody = req.body;

            const answer = {
                id: requestBody.conversationId,
                name: "Han Solo is a character",
                timestamp: Math.floor(Date.now() / 1000),
                messages: [
                    {
                        id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNe_" + Date.now(),
                        conversationId: requestBody.conversationId,
                        role: 'assistant',
                        agentId: requestBody.agentId,
                        message: `Reply to '${requestBody.question}'`,
                        timestamp: Math.floor(Date.now() / 1000),
                        name: null
                    },
                    {
                        id: "msg_Bn07kVDCYT1qmgu1G7Zw0KNeс_" + Date.now(),
                        conversationId: requestBody.conversationId,
                        role: 'assistant',
                        agentId: requestBody.agentId,
                        message: `Reply to '${requestBody.question}' Second`,
                        timestamp: Math.floor(Date.now() / 1000),
                        name: null
                    }
                ]
            };

            req.reply({
                statusCode: 200,
                body: answer
            });
        }).as('get-answer');
    }

    static stubExplainResponse() {
        cy.intercept({
            method: 'POST',
            url: 'rest/chat/conversations/explain'
        }, (req) => {
            const requestBody = req.body;

            const explainResponse = {
                conversationId: requestBody.conversationId,
                answerId: requestBody.answerId,
                queryMethods: [
                    {
                        name: "sparql_query",
                        rawQuery: "SELECT ?character ?name ?height WHERE {\n  ?character a voc:Character;\n             rdfs:label ?name;\n             voc:height ?height.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        query: "SELECT ?character ?name ?height WHERE {\n  ?character a voc:Character;\n             rdfs:label ?name;\n             voc:height ?height.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        queryType: "sparql",
                        errorOutput: "Error: org.eclipse.rdf4j.query.MalformedQueryException: org.eclipse.rdf4j.query.parser.sparql.ast.VisitorException: QName 'voc:Character' uses an undefined prefix"
                    }, {
                        name: "retrieval_search",
                        rawQuery: "{\"queries\":[{\"query\":\"pilots that work with Luke Skywalker\",\"filter\":{\"document_id\":\"https://swapi.co/resource/human/1\"},\"top_k\":3}]}",
                        query: "{\n  \"queries\" : [ {\n    \"query\" : \"pilots that work with Luke Skywalker\",\n    \"filter\" : {\n      \"document_id\" : \"https://swapi.co/resource/human/1\"\n    },\n    \"top_k\" : 3\n  } ]\n}",
                        queryType: "json",
                        errorOutput: null
                    },
                    {
                        name: "iri_discovery",
                        rawQuery: "Luke Skywalker",
                        query: "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX onto: <http://www.ontotext.com/>\nSELECT ?label ?iri {\n    ?label onto:fts ('''Luke~ Skywalker~''' '*') .\n    ?iri rdfs:label|skos:prefLabel ?label .\n}",
                        queryType: "sparql",
                        errorOutput: null
                    },
                    {
                        name: "sparql_query",
                        rawQuery: "SELECT ?height WHERE {\n  <https://swapi.co/resource/human/1> voc:height ?height.\n}",
                        query: "SELECT ?height WHERE {\n  <https://swapi.co/resource/human/1> voc:height ?height.\n}",
                        queryType: "sparql",
                        errorOutput: "Error: org.eclipse.rdf4j.query.MalformedQueryException: org.eclipse.rdf4j.query.parser.sparql.ast.VisitorException: QName 'voc:height' uses an undefined prefix"
                    },
                    {
                        name: "sparql_query",
                        rawQuery: "PREFIX voc: <https://swapi.co/vocabulary/>\nSELECT ?name ?height WHERE {\n  ?character voc:height ?height;\n             rdfs:label ?name.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        query: "PREFIX voc: <https://swapi.co/vocabulary/>\nSELECT ?name ?height WHERE {\n  ?character voc:height ?height;\n             rdfs:label ?name.\n  FILTER(?name = \"Luke Skywalker\" || ?name = \"Leia Organa\")\n}",
                        queryType: "sparql",
                        errorOutput: null
                    },
                    {
                        name: 'fts_search',
                        rawQuery: 'Second Luke',
                        query: 'PREFIX onto: <http://www.ontotext.com/>\nDESCRIBE ?iri {\n\t?x onto:fts \'\'\'Second Luke\'\'\' .\n\t{\n\t\t?x ?p ?iri .\n\t} union {\n\t\t?iri ?p ?x .\n\t}\n}',
                        queryType: "sparql",
                        errorOutput: null
                    }, {
                        name: 'similarity_search',
                        rawQuery: 'Second Luke',
                        query: 'PREFIX onto: <http://www.ontotext.com/>\nDESCRIBE ?iri {\n\t?x onto:fts \'\'\'Second Luke\'\'\' .\n\t{\n\t\t?x ?p ?iri .\n\t} union {\n\t\t?iri ?p ?x .\n\t}\n}',
                        queryType: "sparql",
                        errorOutput: null
                    }, {
                        name: "iri_discovery",
                        rawQuery: "Luke Skywalker",
                        query: "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nPREFIX onto: <http://www.ontotext.com/>\nSELECT ?label ?iri {\n    ?label onto:fts ('''Luke~ Skywalker~''' '*') .\n    ?iri rdfs:label|skos:prefLabel ?label .\n}",
                        queryType: "sparql",
                        errorOutput: null
                    }
                ]
            };

            req.reply({
                statusCode: 200,
                body: explainResponse
            });
        }).as('explain-response');
    }
}
