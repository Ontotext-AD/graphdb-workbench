import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {GuideSteps} from "../../../steps/guides/guide-steps";

describe('Interactive guides without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Interactive guides page via URL without a repository selected
        GuideSteps.visit();
        // Then,
        GuideSteps.verifyInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Interactive guides page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnInteractiveGuides();
        // Then,
        GuideSteps.verifyInitialState();
    });
})
