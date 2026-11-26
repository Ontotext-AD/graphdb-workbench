export class ClassViewsStubs {
    static spyGetDomainRange() {
        cy.intercept('GET', '/rest/domain-range*').as('getDomainRange');
    }

    static spyGetClassHierarchy() {
        cy.intercept('GET', '/rest/class-hierarchy*').as('getClassHierarchy');
    }

    static getDomainRangeRequests() {
        return cy.get('@getDomainRange.all');
    }
}
