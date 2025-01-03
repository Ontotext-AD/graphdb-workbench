export class NamespaceStubs {

    static stubGeneratedOntotextNamespacesResponse(repositoryId, withDelay = 0) {
        NamespaceStubs.stubNameSpaceResponse(repositoryId, '/namespaces/ontotext-generated-namespace.json', withDelay);
    }

    static stubNameSpaceResponse(repositoryId, fixture, withDelay = 0) {
        cy.intercept(`/repositories/${repositoryId}/namespaces`, {fixture, delay: withDelay}).as(`${repositoryId}-stub-namespaces`);
    }

    static stubErrorOnNamespaceUpdate(repositoryId) {
        cy.intercept('PUT', `/repositories/${repositoryId}/namespaces/*`,
            {statusCode: 500, body: 'Internal Server Error'}).as(`stub-namespace-update-error`);
    }
}
