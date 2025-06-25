import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SystemInformationSteps} from "../../../steps/system-information-steps";

describe('System information with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'system-information-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the System information page via URL with a repository selected
        SystemInformationSteps.visit();
        // Then,
        SystemInformationSteps.verifyInitialState();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the System information page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSystemInformation();
        // Then,
        SystemInformationSteps.verifyInitialState();
    });
})
