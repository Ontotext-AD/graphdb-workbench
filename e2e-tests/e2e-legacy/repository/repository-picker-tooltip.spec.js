import {GraphNavigatorSteps} from '../../steps/graph-navigator-steps.js';
import {RepositoryPickerListSteps} from '../../steps/repository-picker-list-steps.js';
import {RepositoriesStubs} from '../../stubs/repositories/repositories-stubs.js';

describe('Repository picker repository information', () => {
    let runningRepositoryId;
    let notRunningRepositoryId;

    beforeEach(() => {
        runningRepositoryId = 'picker-tooltip-running-' + Date.now();
        notRunningRepositoryId = 'picker-tooltip-not-running-' + Date.now();
        cy.createRepository({id: runningRepositoryId});
        cy.createRepository({id: notRunningRepositoryId});
        // A new repository is not running. Requesting its size starts it.
        cy.initializeRepository(runningRepositoryId);
        RepositoriesStubs.spyGetRepositorySize(runningRepositoryId, 'runningRepositorySize');
        RepositoriesStubs.spyGetRepositorySizeCalls(notRunningRepositoryId, 'notRunningRepositorySize');
        // No repository is selected, so the view shows the repository picker with both repositories.
        GraphNavigatorSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(runningRepositoryId);
        cy.deleteRepository(notRunningRepositoryId);
    });

    it('should show the repository id and the statement counts of a running repository', () => {
        // When I move the keyboard focus to a running repository in the picker
        RepositoryPickerListSteps.focusRepository(runningRepositoryId);

        // Then I expect the repository information to show the repository id
        RepositoryPickerListSteps.getRepositoryInfoPart('title').should('have.text', runningRepositoryId);
        // And the statement counts, loaded from the server
        cy.wait('@runningRepositorySize');
        RepositoryPickerListSteps.getRepositoryInfoPart('total').should('contain.text', 'Total statements');
        RepositoryPickerListSteps.getRepositoryInfoPart('explicit').should('be.visible');
        RepositoryPickerListSteps.getRepositoryInfoPart('inferred').should('be.visible');
        RepositoryPickerListSteps.getRepositoryInfoPart('expansion-ratio').should('be.visible');
        RepositoryPickerListSteps.getRepositoryInfoPart('inactive').should('not.exist');
    });

    it('should show that the statement counts are not available when the size request fails', () => {
        // Given the server fails to return the size of the running repository
        RepositoriesStubs.stubGetRepositorySizeError(runningRepositoryId, 'runningRepositorySizeError');

        // When I move the keyboard focus to the running repository in the picker
        RepositoryPickerListSteps.focusRepository(runningRepositoryId);

        // Then I expect the repository information to show the repository id
        RepositoryPickerListSteps.getRepositoryInfoPart('title').should('have.text', runningRepositoryId);
        // And, after the request has failed, that the statement counts are not available
        cy.wait('@runningRepositorySizeError');
        RepositoryPickerListSteps.getRepositoryInfoPart('not-available')
            .should('contain.text', 'Size info not available.');
        // And neither the spinner nor the statement counts
        RepositoryPickerListSteps.getRepositoryInfoPart('loading').should('not.exist');
        RepositoryPickerListSteps.getRepositoryInfoPart('total').should('not.exist');
    });

    it('should show the activation message and not request the size of a repository that is not running', () => {
        // When I move the keyboard focus to a repository that is not running in the picker
        RepositoryPickerListSteps.focusRepository(notRunningRepositoryId);

        // Then I expect the repository information to show the repository id and the activation message
        RepositoryPickerListSteps.getRepositoryInfoPart('title').should('have.text', notRunningRepositoryId);
        RepositoryPickerListSteps.getRepositoryInfoPart('inactive')
            .should('contain.text', 'Activate the repository to view statement information');
        RepositoryPickerListSteps.getRepositoryInfoPart('total').should('not.exist');
        // And the size of the repository is not requested, because that would start the repository
        cy.get('@notRunningRepositorySize').should('not.have.been.called');
    });
});
