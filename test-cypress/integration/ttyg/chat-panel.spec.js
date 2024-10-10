import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {ChatPanelSteps} from "../../steps/ttyg/chat-panel-steps";
import {ApplicationSteps} from "../../steps/application-steps";

describe('Ttyg ChatPanel', () => {

    beforeEach(() => {
        // Create an actual repository to prevent stubbing all background requests that are not related to the ttyg view
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
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
        ChatPanelSteps.getChatDetailActions(0, 0).should('not.be.visible');
        ChatPanelSteps.getChatDetailActions(1, 0).should('be.visible');

        // When I hover over the hidden answer actions.
        ChatPanelSteps.getChatDetailActions(0, 0).realHover();

        // Then I expect answer actions to be visible.
        ChatPanelSteps.getChatDetailActions(1, 0).should('be.visible');

        // When the new question input is empty.
        // The "Ask" button must be disabled.
        ChatPanelSteps.getAskButtonElement().should('be.disabled');

        // When I type a question
        ChatPanelSteps.getQuestionInputElement()
            .should('be.visible')
            .and('not.be.disabled')
            .type('Who is Han Solo?');

        // Then I expect the "Ask" button be not active because agent is not selected
        ChatPanelSteps.getAskButtonElement().should('not.be.enabled');

        // When I select an agent
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(0);

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

        // When I click on regenerate button.
        TTYGStubs.stubAnswerQuestion();
        ChatPanelSteps.regenerateQuestion(2);

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

    // Can't test this on CI
    it.skip('Should copy an answer when click on copy button', () => {
        // When I click on copy button
        ChatPanelSteps.copyAnswer();

        // Then I expect the answer to be copied.
        ApplicationSteps.getSuccessNotifications().contains('The answer was successfully copied to the clipboard.');
    });
});
