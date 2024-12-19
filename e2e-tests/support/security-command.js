Cypress.Commands.add('switchOnSecurity', () => {
    cy.request({
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

Cypress.Commands.add('switchOffSecurity', () => {
    cy.request({
        method: 'POST',
        url: `/rest/security`,
        body: 'false',
        headers: {
            'Content-Type': 'application/json'
        },
        // Prevent Cypress from failing the test on non-2xx status codes
        failOnStatusCode: true
    });
});
