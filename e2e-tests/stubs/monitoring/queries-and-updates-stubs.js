export class QueriesAndUpdatesStubs {
    static stubGetActiveQueries(repositoryId, fixture) {
        cy.intercept({method: 'GET', pathname: `/rest/monitor/repository/${repositoryId}/query/active`}, {fixture}).as('getActiveQueries');
    }
}
