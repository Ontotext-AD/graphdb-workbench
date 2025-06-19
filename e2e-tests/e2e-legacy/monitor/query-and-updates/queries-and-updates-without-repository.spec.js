import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {QueriesAndUpdatesSteps} from "../../../steps/monitoring/queries-and-updates-steps";

describe('Query and Updates without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Query and Updates page via URL without a repository selected
        QueriesAndUpdatesSteps.visit();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Query and Updates page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnQueryAndUpdate();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
})
