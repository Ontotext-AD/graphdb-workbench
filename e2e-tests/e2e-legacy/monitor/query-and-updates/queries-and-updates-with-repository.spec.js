import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {QueriesAndUpdatesSteps} from "../../../steps/monitoring/queries-and-updates-steps";

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

    const verifyInitialStateWithSelectedRepository = () => {
        QueriesAndUpdatesSteps.getQueryAndUpdatePage().should('be.visible');
        QueriesAndUpdatesSteps.getPauseButton().should('be.visible');
        QueriesAndUpdatesSteps.getNoRunningQueriesOrUpdates().should('be.visible')
            .contains('No running queries or updates');
    };
})
