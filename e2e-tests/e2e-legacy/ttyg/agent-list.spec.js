import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {RepositoriesStub} from "../../stubs/repositories-stub";

describe('TTYG agent list', () => {
    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints('starwars');
        cy.presetRepository('starwars');
    });

    /**
     * TODO: Fix me, broken due to migration (Error: unknown)
     */
    it.skip('Should be able to toggle agents panel', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubChatGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-agent-list');
        cy.wait('@get-chat-list');
        cy.wait('@get-chat');
        cy.wait('@get-all-repositories');
        // When the ttyg page is loaded
        // Then I expect tha agent list be closed by default.
        TTYGViewSteps.getAgentsPanel().should('not.be.visible');

        // When I click on "Manage agents"
        TTYGViewSteps.expandAgentsSidebar();
        // Then I should see the agent list with agents filtered by the current repository
        TTYGViewSteps.getAgentsPanel().should('be.visible');
        TTYGViewSteps.verifyAgentList([
            {name: 'agent-1', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars', isRepositoryDeleted: false}
        ]);

        // When I close the agent list panel
        TTYGViewSteps.collapseAgentsSidebar();
        // Then I expect agent list panel to be closed
        TTYGViewSteps.getAgentsPanel().should('be.hidden');
    });

    it('Should be able to filter the agent list by repository', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();
        TTYGStubs.stubChatsListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        cy.wait('@get-chat');
        cy.wait('@get-agent-list');
        cy.wait('@get-chat-list');
        cy.wait('@get-all-repositories');
        // When the ttyg page is loaded
        TTYGViewSteps.getAgents().should('have.length', 2);
        // Then Agent list filter should be set to All
        TTYGViewSteps.getSelectedAgentFilter().should('contain', 'starwars');
        TTYGViewSteps.getAgentFilter().click();
        TTYGViewSteps.verifyRepositoryOptionNotExist('Fedx_repository');
        TTYGViewSteps.verifyRepositoryOptionNotExist('Ontop_repository');
        TTYGViewSteps.getAgentFilter().click();
        // When I filter the agents by repository 'biomarkers'
        TTYGViewSteps.filterAgentsByRepository('biomarkers');
        // Then I should see only 1 agent
        TTYGViewSteps.verifyAgentList([
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers', isRepositoryDeleted: false}
        ]);
        // When I select the 'All' filter
        TTYGViewSteps.filterAgentsByRepository('All');
        // Then I should see all agents
        TTYGViewSteps.verifyAgentList([
            {name: 'agent-1', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'agent-2', repositoryId: 'Not existing repo', isRepositoryDeleted: true},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars', isRepositoryDeleted: false},
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers', isRepositoryDeleted: false}
        ]);
    });

    it('should filter agent actions based on compatibility', () => {
        TTYGStubs.stubAgentListWithIncompatibleGet();
        // When: I visit the ttyg page with incompatible agents
        TTYGViewSteps.visit();
        // Then: Only the delete action should be available for incompatible agents
        TTYGViewSteps.expandAgentsSidebar();
        TTYGViewSteps.openAgentActionMenu(0);
        TTYGViewSteps.getDeleteAgentButton(0).should('be.visible');
        TTYGViewSteps.getCloneAgentButton(0).should('not.exist');
        TTYGViewSteps.getEditAgentButton(0).should('not.exist');
        // And: All actions should be available for compatible agents
        TTYGViewSteps.openAgentActionMenu(1);
        TTYGViewSteps.getDeleteAgentButton(1).should('be.visible');
        TTYGViewSteps.getCloneAgentButton(1).should('be.visible');
        TTYGViewSteps.getEditAgentButton(1).should('be.visible');
    });
});
