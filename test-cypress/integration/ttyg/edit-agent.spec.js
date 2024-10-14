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

});
