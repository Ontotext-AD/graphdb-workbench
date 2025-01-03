export class QueryStubs {

    static stubSparqlHistoryResponse(repositoryId, withDelay = 0) {
        QueryStubs.stubQueryResponse(`/repositories/${repositoryId}`, '/sparql/history-response.json', 'history-response', withDelay);
    }
    static stubQueryResponse(url, fixture, alias, withDelay = 0) {
        cy.intercept(url, {fixture, delay: withDelay}).as(alias);
    }

    static stubQueryErrorResponse(repositoryId, statusCode, errorMessage) {
        cy.intercept('POST', `/repositories/${repositoryId}`, {
            statusCode,
            body: errorMessage
        }).as('queryErrorResultStub');
    }
}
