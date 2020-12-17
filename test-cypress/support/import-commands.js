// import snippetImportTemplate from '../fixtures/snippet-import-template.json';

const UPLOAD_URL = '/rest/data/import/upload/';
const SERVER_IMPORT_URL = '/rest/data/import/server/';
const POLL_INTERVAL = 200;

Cypress.Commands.add('importRDFTextSnippet', (repositoryId, rdf, importSettings = {}) => {
    const importData = Cypress._.defaultsDeep(importSettings, snippetImportTemplate);
    importData.data = rdf;

    cy.request({
        method: 'POST',
        url: UPLOAD_URL + repositoryId + '/text',
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
        url: SERVER_IMPORT_URL + repositoryId,
        body: importData
    }).should((response) => expect(response.status).to.equal(202));
    waitServerOperation(SERVER_IMPORT_URL, repositoryId, fileName);
});

function waitServerOperation(url, repositoryId, fileName) {
    cy.request({
        method: 'GET',
        url: url + repositoryId,
    }).then((response) => {
        const importStatus = Cypress._.find(response.body, (importStatus) => importStatus.name === fileName);
        if (importStatus.status === 'DONE') {
            return;
        }
        cy.wait(POLL_INTERVAL);
        waitServerOperation(url, repositoryId, fileName);
    });
}

const snippetImportTemplate = {
    "name": "Text snippet",
    "status":"NONE",
    "message":"",
    "context":"",
    "type":"text",
    "format":"text/turtle",
    "data":"<http://example.org/#spiderman> <http://www.perceive.net/schemas/relationship/enemyOf> <http://example.org/#green-goblin> ."
};

