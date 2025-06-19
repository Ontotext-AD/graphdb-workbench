import {RepositorySteps} from "../../../steps/repository-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";

function verifyInitialRepositoriesState() {
    RepositorySteps.getRepositoriesList().should('not.exist');
    RepositorySteps.getLocalGraphDBTable()
        .should('be.visible')
        .and('have.length', 1)
        .and('contain', 'There are no repositories in the current location');
}

describe('Repositories view initial state', () => {
    it('should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Repositories page via URL
        RepositorySteps.visit();
        // Then,
        verifyInitialRepositoriesState();
    });

    it('should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Repositories page via the navigation menu
        HomeSteps.visit();
        MainMenuSteps.clickOnRepositories();
        // Then,
        verifyInitialRepositoriesState();
    })
})
