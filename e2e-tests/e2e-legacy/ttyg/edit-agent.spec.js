import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TtygAgentSettingsModalSteps} from "../../steps/ttyg/ttyg-agent-settings-modal.steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import {AutocompleteStubs} from "../../stubs/autocomplete/autocomplete-stubs";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

describe('TTYG edit an agent', () => {
    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStubs.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);
        TTYGStubs.stubAgentDefaultsGet();
    });

    it(' should be able to edit an agent.', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-agent-list');
        cy.wait('@get-chat');
        // When I select an agent that don't have activated additional extraction method
        TTYGViewSteps.openAgentSettingsModalForAgent(0);

        // Then I expect that the iri discovery checkbox is not checked
        TtygAgentSettingsModalSteps.getIriDiscoverySearchCheckbox().should('not.be.checked');

        // When I check the iri discovery checkbox
        TtygAgentSettingsModalSteps.checkIriDiscoverySearchCheckbox();

        // and save the agent.
        TTYGStubs.stubAgentEdit();
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@edit-agent').then((interception) => {
            expect(interception.request.body.additionalExtractionMethods[0].method).to.equal('iri_discovery_search');
        });
        // Then I expect the agent to be saved
        ToasterSteps.verifySuccess('The agent \'agent-1\' was saved successfully.');
    });


    it('should be able to edit Autocomplete extraction method option', () => {
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-autocomplete-query.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-agent-list');
        // When I select an agent that don't have activated additional extraction method
        TTYGViewSteps.openAgentSettingsModalForAgent(0);

        // Then I expect that the autocomplete iri discovery checkbox is not checked
        TtygAgentSettingsModalSteps.getAutocompleteSearchCheckbox().should('not.be.checked');

        // When I check the autocomplete iri discovery checkbox
        TtygAgentSettingsModalSteps.checkAutocompleteSearchCheckbox();

        // Then I can set a value for the max results
        TtygAgentSettingsModalSteps.setAutocompleteMaxResults(2);

        // When I save the agent
        TTYGStubs.stubAgentEdit();
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@edit-agent').then((interception) => {
            const additionalMethod = interception.request.body.additionalExtractionMethods[0];
            expect(additionalMethod).to.not.be.undefined;
            expect(additionalMethod.method).to.equal('autocomplete_iri_discovery_search');
            expect(additionalMethod.limit).to.equal(2);
        });
        // Then I expect the agent to be saved
        ToasterSteps.verifySuccess('The agent \'Test autocomplete extraction agent\' was saved successfully.');
        TTYGViewSteps.editCurrentAgent();
        TtygAgentSettingsModalSteps.toggleAutocompleteSearchPanel();

        // When: I select a repository with disabled autocomplete
        AutocompleteStubs.stubAutocompleteEnabled(false);
        TtygAgentSettingsModalSteps.selectRepository('biomarkers');
        // Then: I expect to see a disabled message
        TtygAgentSettingsModalSteps.getAutocompleteDisabledMessage().should('be.visible');

        // When: I click on the link to enable autocomplete
        TtygAgentSettingsModalSteps.clickOnEnableFTSSearch();
        // Then: I expect a confirmation dialog displayed.
        ModalDialogSteps.getDialogBody().contains('If you proceed with enabling the autocomplete index, GraphDB will open in a new tab and switch to the biomarkers repository.');

        // When: I don't confirm the dialog
        ModalDialogSteps.cancelDialogWithBody('If you proceed with enabling the autocomplete index, GraphDB will open in a new tab and switch to the biomarkers repository.');
        // Then: I expect the dialog be disappeared and the disabled message still visible
        TtygAgentSettingsModalSteps.getAutocompleteDisabledMessage().should('be.visible');
    });

    it('should allow copy of External integration configuration', () => {
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-autocomplete-query.json');
        TTYGStubs.getExternalUrl();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-agent-list');
        // When I select an agent
        TTYGViewSteps.openAgentSettingsModalForAgent(0);

        // Then I should see the External integration configuration button
        TtygAgentSettingsModalSteps.getExtIntegrationConfigBtn().should('be.visible');
        // When I click the button
        TtygAgentSettingsModalSteps.openExtIntegrationConfig();
        cy.wait('@external-url');
        // The url dialog should open
        TtygAgentSettingsModalSteps.getExternalIntegrationModal().should('be.visible');
        // The dialog should have all the fields
        TtygAgentSettingsModalSteps.getAgentUrlField().invoke('val')
            .then((val) => {
                expect(val).to.equal('asst_G8EtHyT8kAGeDmCa3Nh6y74v');
            });

        TtygAgentSettingsModalSteps.getMethodUrlField().invoke('val')
            .then((val) => {
                expect(val).to.equal('http://user-pc:7200/rest/llm/tool/ttyg/asst_G8EtHyT8kAGeDmCa3Nh6y74v');
            });

        TtygAgentSettingsModalSteps.getDifyUrlField().invoke('val')
            .then((val) => {
                expect(val).to.equal('http://user-pc:7200/rest/llm/ttyg/asst_G8EtHyT8kAGeDmCa3Nh6y74v/dify');
            });
    });

    it('should show Context size if not openai-assistants API', () => {
        // Open TTYG page and select first agent
        TTYGViewSteps.visit();
        TTYGStubs.stubForApiType('default');
        cy.wait('@get-agent-list');
        TTYGViewSteps.openAgentSettingsModalForAgent(0);

        // Then I should see the Context size field
        TtygAgentSettingsModalSteps.getContextSizeField().should('be.visible');
        // When I clear the value
        TtygAgentSettingsModalSteps.clearContextSize();
        // And click another field
        TtygAgentSettingsModalSteps.clickLLMModelField();
        // Then the error for required should appear
        TtygAgentSettingsModalSteps.getContextSizeError().should('be.visible');
        // When I type a value
        TtygAgentSettingsModalSteps.enterContextSize('120000');
        // Then the error disappears
        TtygAgentSettingsModalSteps.getContextSizeError().should('not.exist');
        // I should be allowed to reset the value of the Context size
        TtygAgentSettingsModalSteps.resetContextSizeValue();
    });

    it('should NOT show Context size if openai-assistants API', () => {
        // Open TTYG page and select first agent
        TTYGViewSteps.visit();
        TTYGStubs.stubForApiType('assistants');
        cy.wait('@get-agent-list');
        TTYGViewSteps.openAgentSettingsModalForAgent(0);
        // Then I should see the Context size field
        TtygAgentSettingsModalSteps.getContextSizeField().should('not.exist');
    });
});
