import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TtygAgentSettingsModalSteps} from "../../steps/ttyg/ttyg-agent-settings-modal.steps";
import {ToasterSteps} from "../../steps/toaster-steps";
import {RepositoriesStub} from "../../stubs/repositories-stub";

describe('TTYG edit an agent', () => {
    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);
        TTYGStubs.stubAgentDefaultsGet();
    });

    it(' should be able to edit an agent.', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-chat-list');
        cy.wait('@get-agent-list');
        cy.wait('@get-chat');
        // When I select an agent that don't have activated additional extraction method
        TTYGViewSteps.expandAgentsSidebar();
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(0);
        TTYGViewSteps.editCurrentAgent();

        // Then I expect that the iri discovery checkbox is not checked
        TtygAgentSettingsModalSteps.getIriDiscoverySearchCheckbox().should('not.be.checked');

        // When I check the iri discovery checkbox
        TtygAgentSettingsModalSteps.checkIriDiscoverySearchCheckbox();

        // and save the agent.
        TTYGStubs.stubAgentEdit();
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@edit-agent');
        // Then I expect the agent to be saved
        ToasterSteps.verifySuccess('The agent \'agent-1\' was saved successfully.');
        TTYGViewSteps.editCurrentAgent();
        TtygAgentSettingsModalSteps.getIriDiscoverySearchCheckbox().should('be.checked');
    });


    it('should be able to edit Autocomplete extraction method option', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-autocomplete-query.json');
        TTYGStubs.stubAutocompleteResponse();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-agent-list');
        // When I select an agent that don't have activated additional extraction method
        TTYGViewSteps.expandAgentsSidebar();
        TTYGViewSteps.openAgentsMenu();
        TTYGViewSteps.selectAgent(0);
        TTYGViewSteps.editCurrentAgent();

        // Then I expect that the autocomplete iri discovery checkbox is not checked
        TtygAgentSettingsModalSteps.getAutocompleteSearchCheckbox().should('not.be.checked');

        // When I check the autocomplete iri discovery checkbox
        TtygAgentSettingsModalSteps.checkAutocompleteSearchCheckbox();

        // Then I can set a value for the max results
        TtygAgentSettingsModalSteps.setAutocompleteMaxResults(2);

        // Then I can select predicates with the autocomplete
        TtygAgentSettingsModalSteps.enterSearchPredicate('rest');
        cy.wait('@autocomplete-suggestions');
        TtygAgentSettingsModalSteps.selectAutocompleteOption(3);

        // When I save the agent
        TTYGStubs.stubAgentEdit();
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@edit-agent');
        // Then I expect the agent to be saved
        ToasterSteps.verifySuccess('The agent \'Test autocomplete extraction agent\' was saved successfully.');
        TTYGViewSteps.editCurrentAgent();
        TtygAgentSettingsModalSteps.getAutocompleteSearchCheckbox().should('be.checked');
        TtygAgentSettingsModalSteps.toggleAutocompleteSearchPanel();
        TtygAgentSettingsModalSteps.getAutocompleteMaxResults().should('have.value', '2');
        TtygAgentSettingsModalSteps.getSearchPredicateTags().should('have.length', '1');
        TtygAgentSettingsModalSteps.getSearchPredicateTags().should('contain.text', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest');
    });
});
