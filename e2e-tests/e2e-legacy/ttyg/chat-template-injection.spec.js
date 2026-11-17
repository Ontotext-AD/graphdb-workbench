import {RepositoriesStubs} from '../../stubs/repositories/repositories-stubs';
import {TTYGStubs} from '../../stubs/ttyg/ttyg-stubs';
import {TTYGViewSteps} from '../../steps/ttyg/ttyg-view-steps';
import {ChatPanelSteps} from '../../steps/ttyg/chat-panel-steps';
import {BrowserStubs} from '../../stubs/browser-stubs.js';

const EXPRESSION = '{{7*7}}';
const QUERY = `SELECT ?s WHERE { ?s rdfs:label "${EXPRESSION}" }`;

describe('Ttyg chat template injection', () => {

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStubs.stubBaseEndpoints('starwars');
        cy.presetRepository('starwars');
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        // Given a chat whose question and answer contain an AngularJS expression
        TTYGStubs.stubChatGet(0, '/ttyg/chats/get-chat-with-template-injection.json');

        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-agent-list');
        cy.wait('@get-chat');
        cy.wait('@get-all-repositories');
    });

    it('should show AngularJS expressions in the chat literally', () => {
        // Then I expect the expression in the question to be shown as it is, not evaluated
        ChatPanelSteps.getChatDetailQuestionElement(0).should('contain', `What is ${EXPRESSION}?`);
        // And the expression in the answer text and in its SPARQL code block to be shown as it is
        ChatPanelSteps.getAssistantAnswer(0)
            .should('contain', `The answer is ${EXPRESSION}.`)
            .and('contain', QUERY)
            .and('not.contain', '49');
    });

    it('should open the SPARQL query of an answer with its AngularJS expression unchanged', () => {
        // Given the browser does not open new windows
        BrowserStubs.stubWindowOpen();

        // When I open the SPARQL query of the answer in the SPARQL editor
        ChatPanelSteps.openInSparqlEditor(0);

        // Then I expect the query to be opened with the expression unchanged
        cy.get(BrowserStubs.WINDOW_OPEN_ALIAS())
            .should('have.been.calledWith', `sparql?query=${encodeURIComponent(QUERY)}&execute=false`);
    });
});
