import {GlobalOperationsStatusesStub} from "./global-operations-statuses-stub";

export class RepositoriesStub {

    static stubOntopRepository(repositoryId) {
        const alRepositoryResponse = `{
        "":[{
                    "id": "${repositoryId}",
                    "title": "",
                    "uri": "http://b:9000/repositories/${repositoryId}",
                    "externalUrl": "http://b:9000/repositories/${repositoryId}",
                    "local": true,
                    "type": "ontop",
                    "sesameType": "graphdb:OntopRepository",
                    "location": "",
                    "readable": true,
                    "writable": true,
                    "unsupported": false,
                    "state": "RUNNING"
        }]}`;


        cy.intercept('GET', '/rest/repositories/all', {
            statusCode: 200,
            body: alRepositoryResponse
        });
    }

    /**
     * @param {string} repositoryId
     * @param {[]}namespaces - An instance of array object have to be:
     *         {
     *             "prefix" : {
     *                 "type" : "literal",
     *                 "value" : "agg"
     *             },
     *             "namespace" : {
     *                 "type" : "literal",
     *                 "value" : "http://jena.apache.org/ARQ/function/aggregate#"
     *             }
     *         }
     */
    static stubNameSpaces(repositoryId, namespaces = []) {
        const namespacesResponse = `{
                                      "head" : {
                                        "vars" : [
                                          "prefix",
                                          "namespace"
                                        ]
                                      },
                                      "results" : {
                                        "bindings" : ${JSON.stringify(namespaces)}
                                      }
                                    }`;
        cy.intercept('GET', `/repositories/${repositoryId}/namespaces`, {
            statusCode: 200,
            body: namespacesResponse
        });
    }

    static stubAutocomplete() {
        cy.intercept(`/rest/autocomplete/enabled`, {
            statusCode: 200,
            body: {}
        });
    }

    static stubBaseEndpoints(repositoryId, namespaces) {
        RepositoriesStub.stubNameSpaces(repositoryId, namespaces);
        RepositoriesStub.stubAutocomplete();
        GlobalOperationsStatusesStub.stubNoOperationsResponse('starwars');
    }
}
