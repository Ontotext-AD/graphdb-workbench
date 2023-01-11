export class QueryStubs {
    static stubDefaultQueryResponse(repositoryId, withDelay = 0) {
        cy.intercept(`/repositories/${repositoryId}`, {fixture: '/graphql-editor/default-query-response.json', delay: withDelay}).as(`${repositoryId}DefaultQuery`);
    }
}
