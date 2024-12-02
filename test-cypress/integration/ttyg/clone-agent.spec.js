import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TtygAgentSettingsModalSteps} from "../../steps/ttyg/ttyg-agent-settings-modal.steps";
import {RepositoriesStub} from "../../stubs/repositories-stub";

describe('TTYG clone an agent', () => {
    const repositoryId = 'starwars';

    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints(repositoryId);
        cy.presetRepository(repositoryId);
        TTYGStubs.stubAgentDefaultsGet();
    });

    it(' should be able to clone an agent.', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-all-repositories');
        cy.wait('@get-chat');
        cy.wait('@get-agent-list');
        // When I select to clone an agent
        TTYGViewSteps.expandAgentsSidebar();
        TTYGViewSteps.triggerCloneAgentActionMenu(0);
        // Then I expect to see the clone agent settings modal
        TtygAgentSettingsModalSteps.getDialog().should('be.visible');
        TtygAgentSettingsModalSteps.getDialogHeader().should('contain', 'Clone Agent');
        // And I expect the agent name to be prefixed with 'clone-'
        TtygAgentSettingsModalSteps.getAgentNameField().should('have.value', 'clone-agent-1');
        // And the FTS search method should be selected
        TtygAgentSettingsModalSteps.getSelectedExtractionMethods().should('have.length', 1);
        TtygAgentSettingsModalSteps.getSelectedExtractionMethod(0).should('contain', 'Full-text search');
        // And the agent save button should be enabled
        TtygAgentSettingsModalSteps.getSaveAgentButton().should('be.enabled').and('contain', 'Save');
        // When I change the agent name
        TtygAgentSettingsModalSteps.clearAgentName();
        TtygAgentSettingsModalSteps.typeAgentName('agent-11');
        // And I select additional extraction method
        TtygAgentSettingsModalSteps.checkIriDiscoverySearchCheckbox();
        // And save the agent
        // We don't verify the response here, we just want to make sure the request is sent with the correct data
        TTYGStubs.stubAgentCreate();
        TtygAgentSettingsModalSteps.saveAgent();
        cy.wait('@create-agent').then((interception) => {
            assert.deepEqual(interception.request.body, {
                "id": "asst_gAPcrHQQ9ZIxD5eXWH2BNFfo",
                "name": "agent-11",
                "repositoryId": "starwars",
                "model": "gpt-4o",
                "temperature": 0,
                "topP": 0,
                "seed": 0,
                "assistantsInstructions": {
                    "systemInstruction": "",
                    "userInstruction": "If you need to write a SPARQL query, use only the classes and properties provided in the schema and don't invent or guess any. Always try to return human-readable names or labels and not only the IRIs. If SPARQL fails to provide the necessary information you can try another tool too."
                },
                "assistantExtractionMethods": [
                    {
                        "method": "fts_search",
                        "maxNumberOfTriplesPerCall": 44
                    }
                ],
                "additionalExtractionMethods": [
                    {
                        "method": "iri_discovery_search"
                    }
                ]
            });
        });
    });
});
