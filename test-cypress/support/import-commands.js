import snippetImportTemplate from '../fixtures/snippet-import-template.json';

const REPOSITORIES_URL = '/rest/repositories/';
const UPLOAD_URL = '/import/upload/';
const SERVER_URL = '/import/server/';
const POLL_INTERVAL = 200;

Cypress.Commands.add('importRDFTextSnippet', (repositoryId, rdf, importSettings = {}) => {
    const importData = Cypress._.defaultsDeep(importSettings, snippetImportTemplate);
    importData.data = rdf;

    cy.request({
        method: 'POST',
        //url: UPLOAD_URL + repositoryId + '/text',
        url: REPOSITORIES_URL + repositoryId + UPLOAD_URL + '/text',
        body: importData
    }).should((response) => expect(response.status).to.equal(202));
    waitServerOperation(UPLOAD_URL, repositoryId, importData.name);
});

Cypress.Commands.add('importServerFile', (repositoryId, fileName, importSettings = {}) => {
    const importData = {
        fileNames: [fileName],
        importSettings
    };

    cy.request({
        method: 'POST',
        url: REPOSITORIES_URL + repositoryId + SERVER_URL,
        body: importData
    }).should((response) => expect(response.status).to.equal(202));
    waitServerOperation(SERVER_URL, repositoryId, fileName);
});

function waitServerOperation(url, repositoryId, fileName) {
    cy.request({
        method: 'GET',
        url: REPOSITORIES_URL + repositoryId + url
    }).then((response) => {
        const importStatus = Cypress._.find(response.body, (importStatus) => importStatus.name === fileName);
        if (importStatus.status === 'DONE') {
            return;
        }
        cy.wait(POLL_INTERVAL);
        waitServerOperation(url, repositoryId, fileName);
    });
}
