import {GraphsOverviewSteps} from 'steps/explore/graphs-overview-steps';
import {proof, verifyRepoId} from './verify-support';

describe('verify: graphs overview', () => {
    const repositoryId = verifyRepoId('graphs');
    const GRAPH = 'urn:verify:graph1';

    before(() => {
        cy.createRepository({id: repositoryId});
        cy.importRDFTextSnippet(repositoryId, `<${GRAPH}> { <urn:verify:s> <urn:verify:p> <urn:verify:o> . }`,
            {format: 'application/x-trig'});
    });
    after(() => cy.deleteRepository(repositoryId));

    it('lists the default graph and an imported named graph, and opens it', () => {
        cy.presetRepository(repositoryId);
        GraphsOverviewSteps.visit();
        GraphsOverviewSteps.getGraphsOverviewComponent().should('be.visible');
        GraphsOverviewSteps.getDefaultGraphRow().should('be.visible');
        GraphsOverviewSteps.getGraphRow(GRAPH).should('be.visible');
        proof('01-graphs-list');

        GraphsOverviewSteps.getGraphRow(GRAPH).find('a').first().click();
        cy.location('pathname').should('eq', '/resource');
        cy.location('search').should((search) => {
            const params = new URLSearchParams(search);
            expect(params.get('uri')).to.equal(GRAPH);
            expect(params.get('role')).to.equal('context');
        });
        cy.contains(GRAPH).should('be.visible');
        // The context tab lists the graph's statements; wait for the imported one, not just the heading.
        cy.contains('urn:verify:o').should('be.visible');
        proof('02-graph-resource-view');
    });
});
