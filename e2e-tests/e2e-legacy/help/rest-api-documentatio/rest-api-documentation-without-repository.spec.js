import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {RestApiDocumentationSteps} from "../../../steps/rest-api-documentation-steps";

describe('REST API Documentation without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the REST API Documentation page via URL without a repository selected
        RestApiDocumentationSteps.visit();
        // Then,
        RestApiDocumentationSteps.verifyInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the REST API Documentation page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnRestApiDocumentation();
        // Then,
        RestApiDocumentationSteps.verifyInitialState();
    });
})
