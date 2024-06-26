export class Stubs {
    static stubQueryResponse(url, fixture, alias, withDelay = 0) {
        cy.intercept(url, {fixture, delay: withDelay}).as(alias);
    }
}
