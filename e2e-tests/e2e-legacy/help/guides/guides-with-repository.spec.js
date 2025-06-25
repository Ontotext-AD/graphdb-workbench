import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {GuideSteps} from "../../../steps/guides/guide-steps";

describe('Interactive guides with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'interactive-guides-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Interactive guides page via URL with a repository selected
        GuideSteps.visit();
        // Then,
        GuideSteps.verifyInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Interactive guides page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnInteractiveGuides();
        // Then,
        GuideSteps.verifyInitialState();
    });
})
