import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";

describe('TTYG agent list', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'ttyg-repo-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render the agent list', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // Then I should see the agent list
        TTYGViewSteps.getAgentsPanel().should('be.visible');
        verifyAgentList([
            {name: 'agent-1', repositoryId: 'starwars'},
            {name: 'agent-2', repositoryId: 'Deleted repository'},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars'},
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers'}
        ]);
    });

    it('Should render agents panel closed when there are no agents', () => {
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        // And there are no agents, yet
        // Then I expect agent list panel to be closed
        TTYGViewSteps.getAgentsPanel().should('be.hidden');
        // When I open the agent list panel
        TTYGViewSteps.expandAgentsSidebar();
        // Then I should see no agents
        TTYGViewSteps.getAgents().should('have.length', 0);
    });

    it('Should be able to filter the agent list by repository', () => {
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatsListGet();
        // Given I have opened the ttyg page
        TTYGViewSteps.visit();
        // When the ttyg page is loaded
        TTYGViewSteps.getAgents().should('have.length', 4);
        // Then Agent list filter should be set to All
        TTYGViewSteps.getSelectedAgentFilter().should('contain', 'All');
        // And I should see all agents (just check the count, the list is verified in another test)
        TTYGViewSteps.getAgents().should('have.length', 4);
        // When I filter the agents by repository 'starwars'
        TTYGViewSteps.filterAgentsByRepository('starwars');
        // Then I should see only 2 agents
        verifyAgentList([
            {name: 'agent-1', repositoryId: 'starwars'},
            {name: 'Databricks-general-unbiased', repositoryId: 'starwars'}
        ]);
        // When I filter the agents by repository 'biomarkers'
        TTYGViewSteps.filterAgentsByRepository('biomarkers');
        // Then I should see only 1 agent
        verifyAgentList([
            {name: 'Databricks-biomarkers', repositoryId: 'biomarkers'}
        ]);
        // When I select the 'All' filter
        TTYGViewSteps.filterAgentsByRepository('All');
        // Then I should see all agents
        TTYGViewSteps.getAgents().should('have.length', 4);
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
