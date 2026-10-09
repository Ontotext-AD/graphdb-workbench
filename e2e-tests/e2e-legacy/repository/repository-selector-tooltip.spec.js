import HomeSteps from '../../steps/home-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {RepositoriesStubs} from '../../stubs/repositories/repositories-stubs.js';

describe('Repository selector tooltip', () => {
    let runningRepositoryId;
    let notRunningRepositoryId;

    beforeEach(() => {
        runningRepositoryId = 'selector-tooltip-running-' + Date.now();
        notRunningRepositoryId = 'selector-tooltip-not-running-' + Date.now();
        cy.createRepository({id: runningRepositoryId});
        cy.createRepository({id: notRunningRepositoryId});
        // A new repository is not running. Requesting its size starts it.
        cy.initializeRepository(runningRepositoryId);
        RepositoriesStubs.spyGetRepositorySize(runningRepositoryId, 'runningRepositorySize');
        RepositoriesStubs.spyGetRepositorySizeCalls(notRunningRepositoryId, 'notRunningRepositorySize');
        // No repository is selected, so both repositories are in the menu of the selector.
        HomeSteps.visit();
        RepositorySelectorSteps.openRepositorySelectors();
    });

    afterEach(() => {
        cy.deleteRepository(runningRepositoryId);
        cy.deleteRepository(notRunningRepositoryId);
    });

    it('should show the repository id and the statement counts of a running repository', () => {
        // When I hover a running repository in the selector
        RepositorySelectorSteps.hoverRepositoryItem(runningRepositoryId);

        // Then I expect the tooltip to show the repository id
        RepositorySelectorSteps.getRepositoryTooltipPart('title').should('have.text', runningRepositoryId);
        // And the statement counts, loaded from the server
        cy.wait('@runningRepositorySize');
        RepositorySelectorSteps.getRepositoryTooltipPart('total').should('contain.text', 'Total statements');
        RepositorySelectorSteps.getRepositoryTooltipPart('explicit').should('be.visible');
        RepositorySelectorSteps.getRepositoryTooltipPart('inferred').should('be.visible');
        RepositorySelectorSteps.getRepositoryTooltipPart('expansion-ratio').should('be.visible');
        RepositorySelectorSteps.getRepositoryTooltipPart('inactive').should('not.exist');
    });

    it('should show the activation message and not request the size of a repository that is not running', () => {
        // When I hover a repository that is not running in the selector
        RepositorySelectorSteps.hoverRepositoryItem(notRunningRepositoryId);

        // Then I expect the tooltip to show the repository id and the activation message
        RepositorySelectorSteps.getRepositoryTooltipPart('title').should('have.text', notRunningRepositoryId);
        RepositorySelectorSteps.getRepositoryTooltipPart('inactive')
            .should('contain.text', 'Activate the repository to view statement information');
        RepositorySelectorSteps.getRepositoryTooltipPart('total').should('not.exist');
        // And the size of the repository is not requested, because that would start the repository
        cy.get('@notRunningRepositorySize').should('not.have.been.called');
    });
});
