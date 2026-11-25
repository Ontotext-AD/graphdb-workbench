import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {QueriesAndUpdatesSteps} from "../../../steps/monitoring/queries-and-updates-steps";
import {ApplicationSteps} from "../../../steps/application-steps";
import {QueriesAndUpdatesStubs} from "../../../stubs/monitoring/queries-and-updates-stubs";

describe('Queries and Updates with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'queries-and-updates-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Query and Updates page via URL with a repository selected
        QueriesAndUpdatesSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Query and Updates page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnQueryAndUpdate();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('should not allow aborting an update while it is replicated to the cluster', () => {
        // Given an update is being replicated to the cluster
        QueriesAndUpdatesStubs.stubGetActiveQueries(repositoryId, '/monitoring/get-active-queries-cluster-replicating.json');
        // When I open the Queries and Updates page
        QueriesAndUpdatesSteps.visit();
        cy.wait('@getActiveQueries');

        // Then I expect Abort to be disabled
        QueriesAndUpdatesSteps.getAbortButtons().eq(0).should('be.disabled');
        // And its popover to say why
        QueriesAndUpdatesSteps.hoverAbortButton(0);
        ApplicationSteps.getPopover().should('contain.text', 'Update cannot be aborted while being replicated to the cluster');
    });

    const verifyInitialStateWithSelectedRepository = () => {
        QueriesAndUpdatesSteps.getQueryAndUpdatePage().should('be.visible');
        QueriesAndUpdatesSteps.getPauseButton().should('be.visible');
        QueriesAndUpdatesSteps.getNoRunningQueriesOrUpdates().should('be.visible')
            .contains('No running queries or updates');
    };
})
