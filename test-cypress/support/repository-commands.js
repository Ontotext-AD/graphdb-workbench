import repoTemplate from '../fixtures/repo-template.json';

export const REPOSITORIES_URL = '/rest/repositories/';
const AUTOCOMPLETE_URL = '/rest/autocomplete/';

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
    // Note: Going through /rest/repositories because it would not fail if the repo is missing
    const url = REPOSITORIES_URL + id;
    cy.request('DELETE', url).should((response) => expect(response.status).to.equal(200));
});

Cypress.Commands.add('presetRepositoryCookie', (id) => {
    cy.setCookie('com.ontotext.graphdb.repository' + window.location.port, id);
});

/**
 * Speeds up any following requests
 */
Cypress.Commands.add('initializeRepository', (id) => {
    const url = REPOSITORIES_URL + id + '/size';
    cy.request('GET', url).should((response) => expect(response.status).to.equal(200));
});

Cypress.Commands.add('enableAutocomplete', (repositoryId) => {
    toggleAutocomplete(repositoryId, true);
});

Cypress.Commands.add('disableAutocomplete', (repositoryId) => {
    toggleAutocomplete(repositoryId, false);
});

let toggleAutocomplete = (repositoryId, enable) => {
    cy.request({
        method: 'POST',
        url: `${AUTOCOMPLETE_URL}enabled?enabled=${enable}`,
        headers: {
            'X-GraphDB-Repository': repositoryId,
        }
    }).should((response) => expect(response.body).to.equal(`Autocomplete was ${enable ? 'enabled' : 'disabled'}`));
    waitAutocomplete(repositoryId);
};

let waitAutocomplete = function (repositoryId) {
    cy.request({
        method: 'GET',
        url: AUTOCOMPLETE_URL + 'status',
        headers: {
            'X-GraphDB-Repository': repositoryId
        },
    }).then((response) => {
        if (response.status === 200 && response.body === 'READY' || response.body === 'NONE') return;
        cy.wait(POLL_INTERVAL);
        waitAutocomplete(repositoryId);
    });
};
