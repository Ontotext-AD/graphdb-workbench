Cypress.Commands.add('createUser', (options = {}) => {
    cy.request({
        method: 'POST',
        url: `/rest/security/users/${options.username}`,
        body: {
            "password": options.password || "root",
            "appSettings": {
                "DEFAULT_SAMEAS": true,
                "DEFAULT_INFERENCE": true,
                "EXECUTE_COUNT": true,
                "IGNORE_SHARED_QUERIES": false,
                "DEFAULT_VIS_GRAPH_SCHEMA": true
            },
            "grantedAuthorities": options.grantedAuthorities || ["ROLE_USER", "WRITE_REPO_*", "READ_REPO_*"]
        },
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        cy.waitUntil(() => response && response.status === 201); // 201 Created
    });
});

Cypress.Commands.add('deleteUser', (username = {}, secured = false) => {
    let headers = {'Content-Type': 'application/json'};
    if (secured) {
        const authHeader = Cypress.env('adminToken');
        headers = {...headers,
            'Authorization': authHeader
        }
    }
    return cy.request({
        method: 'DELETE',
        url: `/rest/security/users/${username}`,
        headers,
        // Prevent Cypress from failing the test on non-2xx status codes
        failOnStatusCode: false
    });
});
