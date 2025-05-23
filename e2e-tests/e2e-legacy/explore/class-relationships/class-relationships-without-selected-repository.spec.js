import {ClassRelationshipsSteps} from "../../../steps/explore/class-relationships-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {ErrorSteps} from "../../../steps/error-steps";

describe('Class Relationships without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Class Relationships page via URL without a repository selected
        ClassRelationshipsSteps.visit();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Class Relationships page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnClassRelationships();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
})
