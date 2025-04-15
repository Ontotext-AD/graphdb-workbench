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

    // Can't test this on CI. This can only be run in browser.
    it.skip('Should copy an answer when click on copy button', () => {
        // When I click on copy button
        ChatPanelSteps.copyAnswer();

        // Then I expect the answer to be copied.
        ApplicationSteps.getSuccessNotifications().contains('The answer was successfully copied to the clipboard.');
    });
});
