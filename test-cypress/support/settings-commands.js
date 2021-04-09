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
        url: `rest/security/user/${encodeURIComponent('admin')}`,
        headers: {
            'X-GraphDB-Password': undefined
        },
        body: {
            data: {
                appSettings: defaultUserSettings
            }
        }
    }).should((response) => expect(response.status).to.equal(200));
});
