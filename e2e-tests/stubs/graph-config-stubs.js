import {Stubs} from './stubs.js';

export class GraphConfigStubs extends Stubs {
    static stubGetEmptyGraphConfigs() {
        cy.intercept('GET', '/rest/explore-graph/config', {
            statusCode: 200,
            body: [],
        }).as('getEmptyGraphConfigs');
    }

    static stubGetGraphConfigs(fixture = '/graph/graph-configurations.json') {
        GraphConfigStubs.stubQueryResponse(
            '/rest/explore-graph/config',
            fixture,
            'getGraphConfigs');
    }
}
