import {MainMenuSteps} from "../../steps/main-menu-steps";
import HomeSteps from "../../steps/home-steps";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {ErrorSteps} from "../../steps/error-steps";

describe('TTYG initial state without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the TTYG page via URL without a repository selected
        TTYGViewSteps.visit();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the TTYG page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnTTYG();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
});
