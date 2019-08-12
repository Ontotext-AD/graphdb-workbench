import repoTemplate from '../fixtures/repo-template.json';
import snippetImportTemplate from '../fixtures/snippet-import-template.json';

export const REPOSITORIES_URL = '/rest/repositories/';
const AUTOCOMPLETE_URL = '/rest/autocomplete/';
const IMPORT_URL = '/rest/data/import/upload/';

const POLL_INTERVAL = 200;

Cypress.Commands.add('createRepository', (options = {}) => {
    cy.request({
        method: 'POST',
        url: REPOSITORIES_URL,
        body: Cypress._.defaultsDeep(options, repoTemplate),
        headers: {
            'Content-Type': 'application/json'
        }
    }).should((response) => expect(response.status).to.equal(201)); // 201 Created
});

Cypress.Commands.add('deleteRepository', (id) => {
    const url = REPOSITORIES_URL + id;
    cy.request('DELETE', url).should((response) => expect(response.status).to.equal(200));
});

Cypress.Commands.add('importRDFTextSnippet', (repositoryId, rdf, importSettings = {}, waitTimeout = 4000) => {
    const importData = Cypress._.defaultsDeep(importSettings, snippetImportTemplate);
    importData.data = rdf;

    cy.request({
        method: 'POST',
        url: IMPORT_URL + repositoryId + '/text',
        body: importData,
    }).should((response) => expect(response.status).to.equal(202));
    waitImport(repositoryId, importData.name, waitTimeout);
});

let waitImport = function(repositoryId, name, pollTimeout) {
    cy.expect(pollTimeout).to.be.greaterThan(0);
    cy.wait(POLL_INTERVAL);
    cy.request({
        method: 'GET',
        url: IMPORT_URL + repositoryId,
    }).then((response) => {
        if (response.status === 200 && Cypress._.find(response.body, function(o) {return o.name === name}).status === 'DONE') return;
        waitImport(repositoryId, name, pollTimeout - response.duration - POLL_INTERVAL);
    });
};

Cypress.Commands.add('enableAutocomplete', (repositoryId, waitTimeout = 10000) => {
    cy.request({
        method: 'POST',
        url: AUTOCOMPLETE_URL + 'enabled?enabled=true',
        headers: {
            'X-GraphDB-Repository': repositoryId,
        }
    }).should((response) => expect(response.body).to.equal('Autocomplete was enabled'));
    waitAutocomplete(repositoryId, waitTimeout);
});

let waitAutocomplete = function(repositoryId, pollTimeout) {
    cy.expect(pollTimeout).to.be.greaterThan(0);
    cy.wait(POLL_INTERVAL);
    cy.request({
        method: 'GET',
        url: AUTOCOMPLETE_URL + 'status',
        headers: {
            'X-GraphDB-Repository': repositoryId,
        },
    }).then((response) => {
        if (response.status === 200 && response.body === 'READY') return;
        waitAutocomplete(repositoryId, pollTimeout - response.duration - POLL_INTERVAL);
    });
};
