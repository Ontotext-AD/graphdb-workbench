import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {ChatPanelSteps} from "../../steps/ttyg/chat-panel-steps";

describe('Ttyg ChatPanel', () => {

    let repositoryId;

    beforeEach(() => {
        // Create an actual repository to prevent stubbing all background requests that are not related to the ttyg view
        repositoryId = 'starwars';
        cy.createRepository({id: repositoryId});

        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        cy.presetRepository('starwars');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should load chat history and show answer actions', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();

        // When visiting the TTYG page where there is a chat with questions and answers
        TTYGViewSteps.visit();

        // Then I expect chat history to be displayed
        ChatPanelSteps.getChatDetailsElements().should('have.length', 2);
        // and only the actions for the last message are visible.
        ChatPanelSteps.getChatDetailActions(0).should('not.be.visible');
        ChatPanelSteps.getChatDetailActions(1).should('be.visible');

        // When I hover over the hidden answer actions.
        ChatPanelSteps.getChatDetailActions(0).realHover();

        // Then I expect answer actions to be visible.
        ChatPanelSteps.getChatDetailActions(0).should('be.visible');

        // When the new question input is empty.
        // The "Ask" button must be disabled.
        ChatPanelSteps.getAskButtonElement().should('be.disabled');

        // When I type a question
        ChatPanelSteps.getQuestionInputElement().type('Who is Han Solo?');

        // Then I expect the "Ask" button be active.
        ChatPanelSteps.getAskButtonElement().should('be.enabled');

        // When I click on "Ask" button.
        ChatPanelSteps.getAskButtonElement().click();

        // Then I expect the question be in chat history,
        ChatPanelSteps.getChatDetailsElements().should('have.length', 3);
        ChatPanelSteps.getChatDetailQuestionElement(2).contains('Who is Han Solo?');
        // and input field be empty,
        ChatPanelSteps.getQuestionInputElement().should('have.value', '');
        // and "Ask" button be disabled.
        ChatPanelSteps.getAskButtonElement().should('be.disabled');
    });
});
