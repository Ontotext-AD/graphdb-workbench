import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {ChatPanelSteps} from "../../steps/ttyg/chat-panel-steps";
import {ApplicationSteps} from "../../steps/application-steps";
import {RepositoriesStub} from "../../stubs/repositories-stub";

describe('Ttyg ChatPanel', () => {

    beforeEach(() => {
        // Create an actual repository to prevent stubbing all background requests that are not related to the ttyg view
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints('starwars');
        cy.presetRepository('starwars');
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();

        // When visiting the TTYG page where there is a chat with questions and answers
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-agent-list');
        cy.wait('@get-chat');
        cy.wait('@get-all-repositories');
    });

    it('Should load chat history and show answer actions', () => {
        // When I select a chat which last used agent is missing (deleted)
        TTYGViewSteps.selectChat(0, 2);
        // Then I expect chat history to be displayed
        ChatPanelSteps.getChatDetailsElements().should('have.length', 2);
        // and only the actions for the last message are visible.
        ChatPanelSteps.getChatDetailActions(0, 0).should('exist').and('have.css', 'opacity', '0');
        ChatPanelSteps.getChatDetailActions(1, 0).should('exist').and('have.css', 'opacity', '1');

        // When I hover over the hidden answer actions.
        ChatPanelSteps.getChatDetailActions(0, 0).realHover();

        // Then I expect answer actions to be visible.
        ChatPanelSteps.getChatDetailActions(0, 0).should('exist').and('have.css', 'opacity', '1');

        // When the new question input is empty.
        // The "Ask" button must be disabled.
        ChatPanelSteps.getAskButtonElement().should('be.disabled');
        ChatPanelSteps.getQuestionInputElement().should('be.disabled');

        // Then I expect the "Ask" button be not active because agent is not selected
        ChatPanelSteps.getAskButtonElement().should('not.be.enabled');

        // When I select an agent
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(0);

        // When I type a question
        ChatPanelSteps.getQuestionInputElement()
            .should('be.visible')
            .and('not.be.disabled')
            .type('Who is Han Solo?');

        // Then I expect the "Ask" button be active.
        ChatPanelSteps.getAskButtonElement().should('be.enabled');

        // When I click on "Ask" button.
        TTYGStubs.stubAnswerQuestion();
        ChatPanelSteps.getAskButtonElement().scrollIntoView().click();

        // Then I expect the question be in chat history,
        ChatPanelSteps.getChatDetailsElements().should('have.length', 3);
        ChatPanelSteps.getChatDetailQuestionElement(2).contains('Who is Han Solo?');
        // and input field be empty,
        ChatPanelSteps.getQuestionInputElement().should('be.enabled');
        ChatPanelSteps.getQuestionInputElement().should('have.value', '');
        // and "Ask" button be disabled.
        ChatPanelSteps.getAskButtonElement().should('be.disabled');
        // and only the actions for the last message are visible.
        ChatPanelSteps.getChatDetailActions(2, 0).should('not.be.visible');
        ChatPanelSteps.getChatDetailActions(2, 1).should('be.visible');

        // When I click on regenerate button on the last response => +2 messages
        TTYGStubs.stubAnswerQuestion();
        ChatPanelSteps.regenerateQuestion(2, 1);

        // Then I expect the question to be regenerated and appear in the chat history.
        ChatPanelSteps.getChatDetailsElements().should('have.length', 4);
    });

    it('Should show info message that the agent is changed', () => {
        // When select a chat that has answers using different agents
        TTYGViewSteps.selectChat(0, 1);

        // Then I expect to see one messages indicating the agent change.
        ChatPanelSteps.getAgentInfoMessages().should('have.length', 1);
        ChatPanelSteps.getAgentInfoMessage(0).contains('Agent changed to agent-2');

        // When I change the selected agent to one that has not been used yet.
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(3);
        // and ask a new question or click on regenerate button.
        TTYGStubs.stubAnswerQuestion();
        ChatPanelSteps.regenerateQuestion(2);
        // Then I expect to see one messages indicating the agent change.
        ChatPanelSteps.getAgentInfoMessages().should('have.length', 2);
        // The last one is because the agent of the last chat item is different from the selected agent.
        ChatPanelSteps.getAgentInfoMessage(1).contains('Agent changed to Databricks-biomarkers');
    });

    it('Should select last used agent when change the selected chat', () => {
        // Then I expect the last used agent to be selected.
        TTYGViewSteps.getAgentsMenuToggleButton().contains('agent-1');

        // When I select another chat that last used agent is different.
        TTYGViewSteps.selectChat(0, 1);
        TTYGViewSteps.getChatFromGroup(0, 1).should('have.class', 'selected');
        // Then I expect the last used agent be selected.
        TTYGViewSteps.getAgentsMenuToggleButton().contains('agent-2');
    });

    it('Should displays explain response', () => {
        // When I visit the TTYG page, a chat with two questions and answers is loaded.
        // Wait to chat be loaded
        ChatPanelSteps.getChatDetailsElements().should('have.length', 2);

        // Quirk - the first explain response button is sometimes visible and the test fails
        // so by hovering over the view title h1 element we make it disappear
        cy.get('h1').realHover();
        // Then, I expect only the last "Explain" button to be visible.
        TTYGViewSteps.getExplainResponseButton(0).should('not.be.visible');
        TTYGViewSteps.getExplainResponseButton(1).should('be.visible');

        // When I click on first explain response button
        TTYGViewSteps.getExplainResponseButton(0).realHover();
        // Then I expect to explain button to be visible.
        TTYGViewSteps.getExplainResponseButton(0).should('be.visible');

        // When I click on the button.
        TTYGStubs.stubExplainResponse();
        TTYGViewSteps.clickOnExplainResponse(0);
        // Then I expect the hint message to not exist (it should only exist for the last 'Explain' response).
        TTYGViewSteps.getHowDeliverAnswerButton().should('not.exist');

        // Then when I click on explain response button on the second answer
        TTYGStubs.stubExplainResponse('/ttyg/chats/explain-response-2.json');
        TTYGViewSteps.clickOnExplainResponse(1);
        // Then I expect the hint message to exist (it should only exist for the last 'Explain' response).
        TTYGViewSteps.getHowDeliverAnswerButton().should('exist');
        TTYGViewSteps.getHowDeliverAnswerButton().should('have.length', 1);
        // and the raw query in the first query method does not exist because the raw query and query are identical.
        TTYGViewSteps.getRawQuery(1, 0).should('not.exist');
        // it's a SPARQL query
        TTYGViewSteps.getQueryMethodElement(1, 0).should('contain', "SPARQL");
        TTYGViewSteps.getQueryMethodDetailsElement(1, 0).should('contain', "Direct query");
        TTYGViewSteps.getExplainQueryQueryElement(1, 0).contains(" SELECT ?character ?name ?height");

        // the second query - JSON
        TTYGViewSteps.getQueryMethodElement(1, 1).should('contain', "ChatGPT Retrieval");
        TTYGViewSteps.getQueryMethodDetailsElement(1, 1).should('contain', "Direct JSON query");
        TTYGViewSteps.getExplainQueryQueryElement(1, 1).contains("{\n  \"queries\" : [ {\n    \"query\" : \"pilots that work with Luke Skywalker\",\n    \"filter\" : {\n      \"document");

        // the third query - FTS IRI to SPARQL
        // raw query should exist because raw query and query are not identical.
        TTYGViewSteps.getRawQuery(1, 2).should('exist');
        TTYGViewSteps.getQueryMethodElement(1, 2).should('contain', "FTS for IRI discovery");
        TTYGViewSteps.getQueryMethodDetailsElement(1, 2).should('contain', "via SPARQL");
        TTYGViewSteps.getExplainQueryQueryElement(1, 2).contains("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-sch");
    });
});
