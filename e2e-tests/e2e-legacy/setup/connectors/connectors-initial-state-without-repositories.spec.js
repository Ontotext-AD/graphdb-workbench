import {ErrorSteps} from "../../../steps/error-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {ConnectorsSteps} from "../../../steps/setup/connectors-steps";

describe('Connectors initial state without repositories', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Connectors page via URL without a repository selected
        ConnectorsSteps.visit();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Connectors page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnConnectors();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
})
