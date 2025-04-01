import repoTemplate from '../fixtures/repo-template.json';

export const REPOSITORIES_URL = '/rest/repositories/';
const AUTOCOMPLETE_URL = '/rest/autocomplete/';

const PRESET_REPO = 'ls.repository-id';

Cypress.Commands.add('createRepository', (options = {}) => {
    cy.request({
        method: 'POST',
        url: REPOSITORIES_URL,
        body: Cypress._.defaultsDeep(options, repoTemplate),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        cy.waitUntil(() => response && response.status === 201); // 201 Created
    });
});

Cypress.Commands.add('deleteRepository', (id, secured = false) => {
    // Note: Going through /rest/repositories because it would not fail if the repo is missing
    const url = REPOSITORIES_URL + '/' + id;

    // Navigates to the home view => helps by cancelling any pending requests
    // if a test completes too fast and the tested view was about to load something
    // that needs the just deleted repo.
    cy.visit('/', {failOnStatusCode: false});
    let headers = {'Content-Type': 'application/json'};
    if (secured) {
        const authHeader = Cypress.env('adminToken');
        headers = {...headers,
            'Authorization': authHeader
        }
    }
    return cy.request({
            method: 'DELETE',
            url: url,
            headers,
        // Prevent Cypress from failing the test on non-2xx status codes
            failOnStatusCode: false
        });
});

Cypress.Commands.add('presetRepository', (id) => {
    cy.setLocalStorage('ls.repository-id', id);
    cy.waitUntil(() =>
        cy.getLocalStorage(PRESET_REPO)
            .then((preset) => preset && preset === id));
});

/**
 * Speeds up any following requests
 */
Cypress.Commands.add('initializeRepository', (id) => {
    const url = REPOSITORIES_URL + id + '/size';
    cy.request('GET', url)
        .then((response) => {
            cy.waitUntil(() => response && response.status === 200);
        });
});

Cypress.Commands.add('enableAutocomplete', (repositoryId) => {
    toggleAutocomplete(repositoryId, true);
});

Cypress.Commands.add('disableAutocomplete', (repositoryId) => {
    toggleAutocomplete(repositoryId, false);
});

Cypress.Commands.add('getNamespaces', (id) => {
    return cy.request({
        method: 'GET',
        url: `repositories/${id}/namespaces`,
        headers: {
            'Accept': 'application/json'
        }
    });
});

const toggleAutocomplete = (repositoryId, enable) => {
    cy.request({
        method: 'POST',
        url: `${AUTOCOMPLETE_URL}enabled?enabled=${enable}`,
        headers: {
            'X-GraphDB-Repository': repositoryId
        }
    }).then((response) => {
        cy.waitUntil(() => response && response.body === `Autocomplete was ${enable ? 'enabled' : 'disabled'}`);
    });
    waitAutocomplete(repositoryId);
};

const waitAutocomplete = function (repositoryId) {
    cy.waitUntil(() =>
        cy.request({
            method: 'GET',
            url: AUTOCOMPLETE_URL + 'status',
            headers: {
                'X-GraphDB-Repository': repositoryId
            }
        }).then((response) => response.status === 200 && (response.body === 'READY' || response.body === 'NONE')));
};
