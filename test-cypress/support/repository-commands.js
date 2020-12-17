// import repoTemplate from '../fixtures/repo-template.json';

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

Cypress.Commands.add('presetRepository', (id) => {
    cy.setLocalStorage('com.ontotext.graphdb.repository', id);
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

const repoTemplate = {
    "id": "",
    "params": {
        "queryTimeout": {
            "label": "Query time-out (seconds)",
            "name": "queryTimeout",
            "value": "0"
        },
        "imports": {
            "label": "Imported RDF files(';' delimited)",
            "name": "imports",
            "value": ""
        },
        "inMemoryLiteralProperties": {
            "label": "Cache literal language tags",
            "name": "inMemoryLiteralProperties",
            "value": "true"
        },
        "ruleset": {
            "label": "Ruleset",
            "name": "ruleset",
            "value": "rdfsplus-optimized"
        },
        "readOnly": {
            "label": "Read-only",
            "name": "readOnly",
            "value": "false"
        },
        "title": {
            "label": "Repository title",
            "name": "title",
            "value": "GraphDB Free repository"
        },
        "checkForInconsistencies": {
            "label": "Check for inconsistencies",
            "name": "checkForInconsistencies",
            "value": "false"
        },
        "disableSameAs": {
            "label": "Disable owl:sameAs",
            "name": "disableSameAs",
            "value": "true"
        },
        "enableLiteralIndex": {
            "label": "Enable literal index",
            "name": "enableLiteralIndex",
            "value": "true"
        },
        "entityIndexSize": {
            "label": "Entity index size",
            "name": "entityIndexSize",
            "value": "10000000"
        },
        "defaultNS": {
            "label": "Default namespaces for imports(';' delimited)",
            "name": "defaultNS",
            "value": ""
        },
        "enableContextIndex": {
            "label": "Use context index",
            "name": "enableContextIndex",
            "value": "false"
        },
        "baseURL": {
            "label": "Base URL",
            "name": "baseURL",
            "value": "http://example.org/owlim#"
        },
        "queryLimitResults": {
            "label": "Limit query results",
            "name": "queryLimitResults",
            "value": "0"
        },
        "entityIdSize": {
            "label": "Entity ID bit-size",
            "name": "entityIdSize",
            "value": "32"
        },
        "throwQueryEvaluationExceptionOnTimeout": {
            "label": "Throw exception on query time-out",
            "name": "throwQueryEvaluationExceptionOnTimeout",
            "value": "false"
        },
        "repositoryType": {
            "label": "Repository type",
            "name": "repositoryType",
            "value": "file-repository"
        },
        "id": {
            "label": "Repository ID",
            "name": "id",
            "value": "repo-test"
        },
        "storageFolder": {
            "label": "Storage folder",
            "name": "storageFolder",
            "value": "storage"
        },
        "enablePredicateList": {
            "label": "Use predicate indices",
            "name": "enablePredicateList",
            "value": "true"
        }
    },
    "title": "",
    "type": "free"
};
