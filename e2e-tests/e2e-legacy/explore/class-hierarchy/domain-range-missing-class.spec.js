import ClassViewsSteps from '../../../steps/class-views-steps';
import {ClassViewsStubs} from '../../../stubs/explore/class-views-stubs';
import {ApplicationSteps} from '../../../steps/application-steps';

describe('Domain-range graph without a class', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'domain-range-missing-class-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should open the class hierarchy without requesting a domain-range graph', () => {
        // Given the domain-range and class hierarchy requests are watched
        ClassViewsStubs.spyGetDomainRange();
        ClassViewsStubs.spyGetClassHierarchy();
        // When I open the domain-range graph without a class
        ClassViewsSteps.visitDomainRangeGraph();
        // Then I am on the class hierarchy
        ClassViewsSteps.validateUrl('/hierarchy');
        // And no domain-range request or error is shown
        cy.wait('@getClassHierarchy');
        ClassViewsStubs.getDomainRangeRequests().should('have.length', 0);
        ApplicationSteps.getNotifications().should('not.exist');
    });
});
