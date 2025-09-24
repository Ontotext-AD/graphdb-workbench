import {GuidesStubs} from "../../../../stubs/guides/guides-stubs.js";
import {TTYGStubs} from "../../../../stubs/ttyg/ttyg-stubs.js";
import {GuideSteps} from "../../../../steps/guides/guide-steps.js";
import {RepositoriesStubs} from "../../../../stubs/repositories/repositories-stubs.js";
import {GuideDialogSteps} from "../../../../steps/guides/guide-dialog-steps.js";
import {MainMenuSteps} from "../../../../steps/main-menu-steps.js";
import {TtygAgentSettingsModalSteps} from "../../../../steps/ttyg/ttyg-agent-settings-modal.steps.js";
import {TTYGViewSteps} from "../../../../steps/ttyg/ttyg-view-steps.js";
import {ModalDialogSteps} from "../../../../steps/modal-dialog-steps.js";

describe('Edit TTYG agent guide', () => {
    let repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStubs.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);

        GuidesStubs.stubTTYGEditAgentGuide();

        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();

        GuideSteps.runFirstGuide()
        cy.wait('@getGuides');
    });

    it('should end guide when no api key is present', () => {
        TTYGStubs.stubAgentListGetError('Set the config property \'graphdb.llm.api-key\' to your LLM API key');

        GuideDialogSteps.assertDialogWithTitleIsVisible('Edit an agent — 1/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Lab menu.');
        MainMenuSteps.clickOnMenuLab();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Edit an agent — 2/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Talk to Your Graph menu.');
        MainMenuSteps.clickOnTTYGSubmenu();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Missing OpenAI key — 3/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('To use Talk to Your Graph, GraphDB must first be configured to work with LLM API.');
        GuideDialogSteps.clickOnCloseButton();
    });

    it('should edit TTYG agent', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubAgentDefaultsGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubAgentEdit();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Edit an agent — 1/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Lab menu.');
        MainMenuSteps.clickOnMenuLab();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Edit an agent — 2/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Talk to Your Graph menu.');
        MainMenuSteps.clickOnTTYGSubmenu();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Edit an agent — 4/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('An agent\'s configuration such as the extraction methods can be reconfigured at any time');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Edit an agent — 11/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the edit agent button to edit the configuration of the selected agent.');
        TTYGViewSteps.editCurrentAgent();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL search query method — 13/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Enabling SPARQL search allows the agent to answers questions by performing a SPARQL query');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL search query method — 14/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the toggle to enable SPARQL search query method.');
        TtygAgentSettingsModalSteps.enableSparqlExtractionMethod();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL search query method — 15/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the toggle to enable providing an ontology in a named graph.');
        TtygAgentSettingsModalSteps.selectSparqlMethodOntologyGraph();

        GuideDialogSteps.assertDialogWithTitleIsVisible('SPARQL search query method — 16/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Type http://example.com as the named graph which contains the ontology.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Edit an agent — 17/18');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click to save the agent settings.');
        TtygAgentSettingsModalSteps.saveAgent();
        ModalDialogSteps.getDialog().should('not.exist');
    });
});
