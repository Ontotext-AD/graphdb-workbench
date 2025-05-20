import {MainMenuSteps} from "../../../../steps/main-menu-steps";
import {GraphsOverviewSteps} from "../../../../steps/explore/graphs-overview-steps";
import HomeSteps from "../../../../steps/home-steps";
import {RepositoryErrorsWidgetSteps} from "../../../../steps/widgets/repository-errors-widget-steps";

describe('Initial state of the Graphs Overview view with a selected repository', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // When: I visit the Graphs Overview page via URL with a repository selected
        GraphsOverviewSteps.visit();
        // Then:
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // When: I visit the Graphs Overview page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnGraphsOverview();
        // Then:
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
        GraphsOverviewSteps.getGraphsSearchInput().should('be.visible');
        GraphsOverviewSteps.getGraphsPaginator().should('be.visible');
        GraphsOverviewSteps.getClearRepositoryButton().should('be.visible');
        GraphsOverviewSteps.getExportRepositoryButton().should('be.visible');
        GraphsOverviewSteps.getDownloadAllButtons().should('be.visible');
        GraphsOverviewSteps.getResultsElement().should('be.visible');
    };
});
