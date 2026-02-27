import {GuidesStubs} from "../../../../stubs/guides/guides-stubs.js";
import {TTYGStubs} from "../../../../stubs/ttyg/ttyg-stubs.js";
import {GuideSteps} from "../../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../../steps/guides/guide-dialog-steps.js";
import {TTYGViewSteps} from "../../../../steps/ttyg/ttyg-view-steps.js";
import {ChatPanelSteps} from "../../../../steps/ttyg/chat-panel-steps.js";
import {RepositoriesStubs} from "../../../../stubs/repositories/repositories-stubs.js";
import {TtygAgentSettingsModalSteps} from "../../../../steps/ttyg/ttyg-agent-settings-modal.steps.js";
import {BrowserStubs} from '../../../../stubs/browser-stubs.js';

describe('ttyg-conversation-guide', () => {
    let repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStubs.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);
        GuidesStubs.stubTTYGConversationGuide();
        TTYGStubs.stubAgentDefaultsGet();
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubCreateNewChat();
        TTYGStubs.stubExplainResponse('/ttyg/chats/explain-response-3.json');

        GuideSteps.visit();
        BrowserStubs.stubWindowOpen();

        GuideSteps.verifyGuidesListExists();

        GuideSteps.runFirstGuide()
        cy.wait('@getGuides');
        cy.wait('@get-chat-list');
        cy.wait('@get-agent-list');
        cy.wait('@get-all-repositories');
        cy.wait('@get-chat');
    });

    it('should select an agent and have a conversation', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Select an agent — 1/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('To talk to your graph, you need to select an agent first');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Select an agent — 2/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the agents dropdown to see available agents');
        TTYGViewSteps.openAgentsMenu();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Select an agent — 3/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on you agent from the dropdown to select it');
        TTYGViewSteps.selectAgent(0);

        GuideDialogSteps.assertDialogWithTitleIsVisible('Conversation with the agent — 2/12');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click the button to create a new chat');
        TTYGViewSteps.createANewChat();

        const codeToType = 'Count all the web pages published in 2020? Provide five sample names.'

        GuideDialogSteps.assertDialogWithTitleIsVisible('Ask the agent — 3/12');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Type "${codeToType}" in the input and press enter`);
        ChatPanelSteps.typeQuestion(codeToType);
        ChatPanelSteps.askQuestionWithEnter();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Ask the agent — 4/12');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Wait for the answer to be returned and explore it. When ready proceed by clicking next.`);
        ChatPanelSteps.waitForLoaderToDisappear();
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Ask the agent — 6/12');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Explain the answer by clicking on the 'Explain response' button.`);
        TTYGViewSteps.clickOnExplainResponse(0);
        cy.wait('@explain-response');

        GuideDialogSteps.assertDialogWithTitleIsVisible('Ask the agent — 7/12');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Wait for the answer to be returned and explore it. When ready proceed by clicking next.`);
        ChatPanelSteps.waitForLoaderToDisappear();
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Ask the agent — 9/12');
        GuideDialogSteps.assertDialogWithContentIsVisible(`You can open the query in the SPARQL editor by clicking on 'Open in SPARQL editor' button. When you are ready, return to the page.`);
        TtygAgentSettingsModalSteps.clickOpenQueryInSparqlEditor();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Ask the agent — 11/12');
        GuideDialogSteps.assertDialogWithContentIsVisible(`You can ask the agent how it derived the answer by clicking on the button`);
        TTYGViewSteps.clickOnHowDeliverAnswerButton();
        cy.wait('@create-chat')
        cy.wait('@create-chat')

        GuideDialogSteps.assertDialogWithTitleIsVisible('Ask the agent — 12/12');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Wait for the answer to be returned and explore it. When ready proceed by clicking next.`);
        GuideDialogSteps.clickOnCloseButton();
    });
})
