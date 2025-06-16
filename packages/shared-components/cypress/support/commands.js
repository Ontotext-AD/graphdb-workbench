// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Simulates a click outside any element (on the body)
Cypress.Commands.add('clickOutside', () => {
    cy.get('body').click(0, 0);
});

/**
 * Get element by testId. Can be chained to another cypress command, or used directly
 *
 * @Example
 * MySteps.getSomething().getByTestId('my-test-id');
 * Or
 * cy.getByTestId('my-test-id');
 */
Cypress.Commands.add('getByTestId', {prevSubject: 'optional'}, (subject, testId) => {
    return subject
        ? cy.wrap(subject).find(buildTestIdAttr(testId))
        : cy.get(buildTestIdAttr(testId));
});

function buildTestIdAttr(testId) {
    return `[data-test="${testId}"]`;
}
