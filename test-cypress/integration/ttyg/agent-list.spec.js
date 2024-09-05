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
