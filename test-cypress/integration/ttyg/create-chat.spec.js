import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {RepositoriesStub} from "../../stubs/repositories-stub";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {ChatPanelSteps} from "../../steps/ttyg/chat-panel-steps";
import HomeSteps from "../../steps/home-steps";

describe('Ttyg ChatPanel', () => {
    beforeEach(() => {
        // Create an actual repository to prevent stubbing all background requests that are not related to the ttyg view
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints('starwars');
        cy.presetRepository('starwars');
        TTYGStubs.stubChatsListGet("/ttyg/chats/create/get-chats-before-create.json");
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();

        // When visiting the TTYG page where there is a chat with questions and answers
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-agent-list');
        cy.wait('@get-chat');
        cy.wait('@get-all-repositories');
    });

    it('Should persist the newly created chat in local store', () => {
        // When I visit the TTYG page
        // the first chat should be selected
        TTYGViewSteps.getChatFromGroup(0, 0).should('have.class', 'selected');
        TTYGViewSteps.getChatsFromGroup(0).should('have.length', 1);

        // When I click on "Create a new chat" button
        TTYGViewSteps.createANewChat();
        // Then I expect no new chat be created
        TTYGViewSteps.getChatFromGroup(0, 0).should('have.not.class', 'selected');
        TTYGViewSteps.getChatsFromGroup(0).should('have.length', 1);

        // When I type a question
        ChatPanelSteps.getQuestionInputElement()
            .should('be.visible')
            .and('not.be.disabled')
            .type('Who is Han Solo?');

        // Then I expect the "Ask" button be active.
        ChatPanelSteps.getAskButtonElement().should('be.enabled');

        // When I click on "Ask" button.
        TTYGStubs.stubCrateNewChat();
        ChatPanelSteps.getAskButtonElement().scrollIntoView().click();
        cy.wait('@create-chat');

        // Then I expect new chat to be created in a new group "Today" and be selected
        TTYGViewSteps.getChatGroup(0).should('contain', 'Today');
        TTYGViewSteps.getChatFromGroup(0, 0).should('have.class', 'selected');
        TTYGViewSteps.getChatsFromGroup(1).should('have.length', 1);

        // When I go to another page
        HomeSteps.visit();
        // and returns to the TTYG page
        TTYGStubs.stubChatsListGet("/ttyg/chats/create/get-chats-after-create.json");
        TTYGStubs.stubAgentGet();
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-agent');
        // Then I expect newly created chat be selected.
        TTYGViewSteps.getChatFromGroup(0, 0).should('contain', 'New chat of Han Solo is a character');
        TTYGViewSteps.getChatFromGroup(0, 0).should('have.class', 'selected');
    });
});
