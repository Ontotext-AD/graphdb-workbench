import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {NamespaceStubs} from "../../stubs/namespace-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TtygAgentSettingsModalSteps} from "../../steps/ttyg/ttyg-agent-settings-modal.steps";
import {ToasterSteps} from "../../steps/toaster-steps";

describe('TTYG create new agent', () => {
    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        cy.presetRepository(repositoryId);
        NamespaceStubs.stubNameSpaceResponse(repositoryId, '/namespaces/get-repository-starwars-namespaces.json');
    });

    it(' should be able to edit an agent.', () => {
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();

        // When I select an agent that don't have activated additional extraction method
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

        // Then I expect the agent to be saved
        ToasterSteps.verifySuccess('The agent \'agent-1\' was saved successfully.');
        TTYGViewSteps.editCurrentAgent();
        TtygAgentSettingsModalSteps.getIriDiscoverySearchCheckbox().should('be.checked');
    });

});
