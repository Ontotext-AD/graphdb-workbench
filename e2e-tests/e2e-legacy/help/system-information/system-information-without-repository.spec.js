import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SystemInformationSteps} from "../../../steps/system-information-steps";

describe('System information without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the System information page via URL without a repository selected
        SystemInformationSteps.visit();
        // Then,
        SystemInformationSteps.verifyInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the System information page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSystemInformation();
        // Then,
        SystemInformationSteps.verifyInitialState();
    });
})
