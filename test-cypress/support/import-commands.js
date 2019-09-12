import urlImportTemplate from '../fixtures/url-import-template.json';
import snippetImportTemplate from '../fixtures/snippet-import-template.json';

const UPLOAD_URL = '/rest/data/import/upload/';
const SERVER_IMPORT_URL = '/rest/data/import/server/';
const POLL_INTERVAL = 200;

Cypress.Commands.add('importRDFTextSnippet', (repositoryId, rdf, importSettings = {}, waitTimeout = 30000) => {
    const importData = Cypress._.defaultsDeep(importSettings, snippetImportTemplate);
    importData.data = rdf;

    cy.request({
        method: 'POST',
        url: UPLOAD_URL + repositoryId + '/text',
        body: importData,
    }).should((response) => expect(response.status).to.equal(202));
    waitUpload(repositoryId, importData.name, waitTimeout);
});

Cypress.Commands.add('importServerFile', (repositoryId, fileName, importSettings = {}, waitTimeout = 30000) => {
    let importData = {
        fileNames: [fileName],
        importSettings
    };

    cy.request({
        method: 'POST',
        url: SERVER_IMPORT_URL + repositoryId,
        body: importData,
    }).should((response) => expect(response.status).to.equal(202));
    waitServerImport(repositoryId);
});

function waitServerImport(repositoryId) {
    cy.request({
        method: 'GET',
        url: SERVER_IMPORT_URL + repositoryId,
    }).then((response) => {
        if (response.status === 200 && response.statusText === 'OK') {
            return;
        }
        cy.wait(POLL_INTERVAL);
        waitServerImport(repositoryId);
    });
}

function waitUpload(repositoryId, name) {
    cy.request({
        method: 'GET',
        url: UPLOAD_URL + repositoryId,
    }).then((response) => {
        const importStatus = Cypress._.find(response.body, (importStatus) => importStatus.name === name);
        if (importStatus.status === 'DONE') {
            return;
        }
        cy.wait(POLL_INTERVAL);
        waitUpload(repositoryId, name);
    });
}
