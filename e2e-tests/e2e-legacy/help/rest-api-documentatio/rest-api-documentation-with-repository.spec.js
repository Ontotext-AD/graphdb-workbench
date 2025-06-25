import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {RestApiDocumentationSteps} from "../../../steps/rest-api-documentation-steps";

describe('REST API Documentation with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'rest-api-documentation-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the REST API Documentation page via URL with a repository selected
        RestApiDocumentationSteps.visit();
        // Then,
        RestApiDocumentationSteps.verifyInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the REST API Documentation page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnRestApiDocumentation();
        // Then,
        RestApiDocumentationSteps.verifyInitialState();
    });
})
