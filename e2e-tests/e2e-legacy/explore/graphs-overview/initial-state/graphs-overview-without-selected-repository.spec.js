import {MainMenuSteps} from "../../../../steps/main-menu-steps";
import {GraphsOverviewSteps} from "../../../../steps/explore/graphs-overview-steps";
import HomeSteps from "../../../../steps/home-steps";
import {RepositoryErrorsWidgetSteps} from "../../../../steps/widgets/repository-errors-widget-steps";

describe('Initial state of the Graphs Overview view without a selected repository', () => {

    it('Should display the correct initial state when navigating via URL', () => {
        // When: I visit the Graphs Overview page via URL without a selected repository
        GraphsOverviewSteps.visit();
        // Then:
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // When: I visit the Graphs Overview page via the navigation menu without a selected repository
        HomeSteps.visit();
        MainMenuSteps.clickOnGraphsOverview();
        // Then:
        verifyInitialStateWithoutSelectedRepository();
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        RepositoryErrorsWidgetSteps.getWidget().should('be.visible');
        GraphsOverviewSteps.getGraphsSearchInput().should('be.hidden');
        GraphsOverviewSteps.getGraphsPaginator().should('be.hidden');
        GraphsOverviewSteps.getClearRepositoryButton().should('be.hidden');
        GraphsOverviewSteps.getExportRepositoryButton().should('be.hidden');
        GraphsOverviewSteps.getDownloadAllButtons().should('be.hidden');
        GraphsOverviewSteps.getResultsElement().should('be.hidden');
    };
});
