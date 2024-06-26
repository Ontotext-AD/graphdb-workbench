import snippetImportTemplate from '../fixtures/snippet-import-template.json';

const REPOSITORIES_URL = '/rest/repositories/';
const UPLOAD_URL = '/import/upload';
const SERVER_URL = '/import/server';
const POLL_INTERVAL = 200;

// Imports a graphql schema to the repository
Cypress.Commands.add('uploadGraphqlSchema', (repositoryId, schemaPath, schemaId ) => {
    cy.fixture(schemaPath).then((schema) => {
        cy.request({
            method: 'POST',
            url: `${REPOSITORIES_URL}${repositoryId}/graphql/manage/endpoints/import`,
            headers: {'Content-type': 'text/yaml'},
            body: schema
        }).should((response) => expect(response.status).to.equal(200));
        waitForGraphqlSchema(repositoryId, schemaId);
    });
});

// Waits for the schema import to finish
function waitForGraphqlSchema(repositoryId, schemaId) {
    cy.request({
        method: 'GET',
        url: `${REPOSITORIES_URL}${repositoryId}/graphql/manage/endpoints/${schemaId}`
    }).then((response) => {
        // const importStatus = Cypress._.find(response.body, (importStatus) => importStatus.name === fileName);
        if (response.status === 200 && response.body && response.body.id === schemaId) {
            return;
        }
        cy.wait(POLL_INTERVAL);
        waitForGraphqlSchema(repositoryId, schemaId);
    });
}

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

Cypress.Commands.add('deleteUploadedFile', (repositoryId, fileName) => {
    const fileNames = Array.isArray(fileName)? fileName : [fileName];
    cy.request({
        method: 'DELETE',
        url: `${REPOSITORIES_URL}${repositoryId}/import/upload/status?remove=true`,
        body: fileNames,
        headers: {'Content-type': 'application/json;charset=utf-8'}
    }).should((response) => expect(response.status).to.equal(200));
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
