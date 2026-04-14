/**
 * Custom Cypress command to retrieve the value of a query parameter from the current page URL.
 *
 * @param {string} key - The name of the query parameter to retrieve.
 * @returns {Cypress.Chainable<string | null>} A chainable that resolves to the value of the query parameter,
 * or null if the parameter is not present.
 */
Cypress.Commands.add('getQueryParam', (key) => {
    return cy.location('search').then((search) => {
        const params = new URLSearchParams(search);
        return params.get(key);
    });
});
