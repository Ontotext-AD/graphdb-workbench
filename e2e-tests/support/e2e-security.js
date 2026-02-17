import './e2e';

beforeEach(() => {
    cy.loginAsAdmin();
    // Switch off security after each test to ensure that tests are independent and don't affect each other.
    // For example, if security is enabled in one test, it can cause other tests that don't expect security to fail.
    cy.switchOffSecurity(true);
    cy.switchOffFreeAccess(true);
});
