Cypress.Commands.add('setDefaultUserData', () => {
    const defaultUserSettings = {
        'DEFAULT_SAMEAS': true,
        'DEFAULT_INFERENCE': true,
        'EXECUTE_COUNT': true,
        'IGNORE_SHARED_QUERIES': false,
        'DEFAULT_VIS_GRAPH_SCHEMA': true
    };
    cy.request({
        method: 'PATCH',
        url: `rest/security/users/${encodeURIComponent('admin')}`,
        headers: {
            'X-GraphDB-Password': 'root'
        },
        body: {
            data: {
                appSettings: defaultUserSettings
            }
        }
    }).then((response) => {
        cy.waitUntil(() => response && response.status === 200); // 201 Created
    });
});
