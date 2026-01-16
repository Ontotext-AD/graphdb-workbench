const REPOSITORIES_URL = '/repositories/';
const STATEMENTS_URL = '/statements';

Cypress.Commands.add('createConnector', (repositoryId, connectorType, connectorName) => {
    cy.request({
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url: REPOSITORIES_URL + repositoryId + STATEMENTS_URL,
        body: `update=PREFIX%20%3A%3Chttp%3A%2F%2Fwww.ontotext.com%2Fconnectors%2F${connectorType}%23%3E%0APREFIX%20inst%3A%3Chttp%3A%2F%2Fwww.ontotext.com%2Fconnectors%2F${connectorType}%2Finstance%23%3E%0AINSERT%20DATA%20%7B%0A%09inst%3A${connectorName}%20%3AcreateConnector%20'''%0A%7B%0A%20%20%22fields%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22fieldName%22%3A%20%22sss%22%2C%0A%20%20%20%20%20%20%22propertyChain%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%22rdf%3Alabel%22%0A%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%22indexed%22%3A%20true%2C%0A%20%20%20%20%20%20%22stored%22%3A%20true%2C%0A%20%20%20%20%20%20%22analyzed%22%3A%20true%2C%0A%20%20%20%20%20%20%22multivalued%22%3A%20true%2C%0A%20%20%20%20%20%20%22ignoreInvalidValues%22%3A%20false%2C%0A%20%20%20%20%20%20%22facet%22%3A%20true%0A%20%20%20%20%7D%0A%20%20%5D%2C%0A%20%20%22languages%22%3A%20%5B%5D%2C%0A%20%20%22types%22%3A%20%5B%0A%20%20%20%20%22rdf%3Alabel%22%0A%20%20%5D%2C%0A%20%20%22readonly%22%3A%20false%2C%0A%20%20%22detectFields%22%3A%20false%2C%0A%20%20%22importGraph%22%3A%20false%2C%0A%20%20%22skipInitialIndexing%22%3A%20false%2C%0A%20%20%22boostProperties%22%3A%20%5B%5D%2C%0A%20%20%22stripMarkup%22%3A%20false%0A%7D%0A'''%20.%0A%7D%0A`
    }).should((response) => expect(response.status).to.equal(204));
});
