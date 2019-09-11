import urlImportTemplate from '../fixtures/url-import-template.json';
import snippetImportTemplate from '../fixtures/snippet-import-template.json';

const IMPORT_URL = '/rest/data/import/upload/';
const POLL_INTERVAL = 200;

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

function waitImport(repositoryId, name) {
    cy.request({
        method: 'GET',
        url: IMPORT_URL + repositoryId,
    }).then((response) => {
        const importStatus = Cypress._.find(response.body, (importStatus) => importStatus.name === name);
        if (importStatus.status === 'DONE') {
            return;
        }
        cy.wait(POLL_INTERVAL);
        waitImport(repositoryId, name);
    });
}
