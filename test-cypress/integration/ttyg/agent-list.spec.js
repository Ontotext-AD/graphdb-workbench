import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";

describe('TTYG agent list', () => {
    beforeEach(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        cy.presetRepository('starwars');
    });

    it('Should render the agent list', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // Then I should see the agent list with agents filtered by the current repository
        TTYGViewSteps.getAgentsPanel().should('be.visible');
        verifyAgentList([
            {name: 'agent-1', repositoryId: 'starwars'},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars'}
        ]);
    });

    it('Should be able to toggle agents panel', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // Then I should see the agent list
        TTYGViewSteps.getAgents().should('have.length', 2);
        // When I close the agent list panel
        TTYGViewSteps.collapseAgentsSidebar();
        // Then I expect agent list panel to be closed
        TTYGViewSteps.getAgentsPanel().should('be.hidden');
        // When I open the agent list panel
        TTYGViewSteps.expandAgentsSidebar();
        // Then I should see no agents
        TTYGViewSteps.getAgentsPanel().should('be.visible');
        TTYGViewSteps.getAgents().should('have.length', 2);
    });

    it('Should be able to filter the agent list by repository', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        TTYGViewSteps.getAgents().should('have.length', 2);
        // Then Agent list filter should be set to All
        TTYGViewSteps.getSelectedAgentFilter().should('contain', 'starwars');
        // When I filter the agents by repository 'biomarkers'
        TTYGViewSteps.filterAgentsByRepository('biomarkers');
        // Then I should see only 1 agent
        verifyAgentList([
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers'}
        ]);
        // When I select the 'All' filter
        TTYGViewSteps.filterAgentsByRepository('All');
        // Then I should see all agents
        verifyAgentList([
            {name: 'agent-1', repositoryId: 'starwars'},
            {name: 'agent-2', repositoryId: 'Deleted repository'},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars'},
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers'}
        ]);
    });
});

/**
 * @param {*[]} data
 */
function verifyAgentList(data) {
    TTYGViewSteps.getAgents().should('have.length', data.length);
    data.forEach((agent, index) => {
        TTYGViewSteps.getAgent(index).within(() => {
           cy.get('.agent-name').should('contain', agent.name);
           cy.get('.related-repository').should('contain', agent.repositoryId);
        });
    });
}
