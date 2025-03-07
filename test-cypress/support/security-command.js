Cypress.Commands.add('switchOnSecurity', () => {
    return cy.request({
        method: 'POST',
        url: `/rest/security`,
        body: 'true',
        headers: {
            'Content-Type': 'application/json'
        },
        // Prevent Cypress from failing the test on non-2xx status codes
        failOnStatusCode: false
    });
});

Cypress.Commands.add('loginAsAdmin', () => {
    return cy.request({
        method: 'POST',
        url: '/rest/login',
        body: {
            username: 'admin',
            password: 'root',
        },
        headers: {
            'Content-Type': 'application/json',
        },
        failOnStatusCode: true,
    }).then((response) => {
        const authHeader = response.headers['authorization'];
        Cypress.env('adminToken', authHeader);
    });
});

Cypress.Commands.add('switchOffSecurity', (secured = false) => {
    let headers = {'Content-Type': 'application/json'};
    if (secured) {
        const authHeader = Cypress.env('adminToken');
        headers = {...headers,
            'Authorization': authHeader
        }
    }
    return cy.request({
        method: 'POST',
        url: '/rest/security',
        body: 'false',
        headers,
        failOnStatusCode: true,
    });
});

Cypress.Commands.add('switchOffFreeAccess', (secured = false) => {
    let headers = {'Content-Type': 'application/json'};
    if (secured) {
        const authHeader = Cypress.env('adminToken');
        headers = {...headers,
            'Authorization': authHeader
        }
    }
    return cy.request({
        method: 'POST',
        url: '/rest/security/free-access',
        body: {
            'enabled': false
        },
        headers,
        failOnStatusCode: true,
    });
});
