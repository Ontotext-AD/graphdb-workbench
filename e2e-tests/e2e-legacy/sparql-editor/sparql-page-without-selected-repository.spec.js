import SparqlSteps from "../../steps/sparql-steps";
import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {PageRestrictionsSteps} from "../../steps/page-restrictions-steps.js";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs.js";

const NO_SELECTED_REPOSITORY_MESSAGE = 'Some functionalities are not available because you are not connected to any repository. Select a repository below or create a new one.';
const NO_REPOSITORIES_MESSAGE = 'There are no accessible repositories. You can create a new repository.';

describe('SPARQL page without selected repository', () => {

    context('when repositories exist', () => {
        let repositoryId;

        beforeEach(() => {
            repositoryId = 'sparql-without-selected-repository-' + Date.now();
            cy.createRepository({id: repositoryId});
        });

        afterEach(() => {
            cy.deleteRepository(repositoryId);
        });

        it('should render SPARQL page without selected repository via URL', () => {
            // Given, I haven't selected a repository
            // When I visit the SPARQL page via URL
            SparqlSteps.visit();
            // Then I see that I am not connected to a repository
            validateSparqlPageRestrictedWith(NO_SELECTED_REPOSITORY_MESSAGE);
        });

        it('should render SPARQL page without selected repository via navigation menu', () => {
            // Given, I haven't selected a repository
            HomeSteps.visit();
            // When I open the SPARQL page via the navigation menu
            MainMenuSteps.clickOnSparqlMenu();
            // Then I see that I am not connected to a repository
            validateSparqlPageRestrictedWith(NO_SELECTED_REPOSITORY_MESSAGE);
        });
    });

    context('when there are no repositories', () => {
        beforeEach(() => {
            // The stub keeps the test independent of repositories that other specs leave behind.
            RepositoriesStubs.stubRepositories(0, '/repositories/get-no-repositories.json');
        });

        it('should render SPARQL page without repositories via URL', () => {
            // Given, there are no repositories
            // When I visit the SPARQL page via URL
            SparqlSteps.visit();
            // Then I see that there are no repositories
            validateSparqlPageRestrictedWith(NO_REPOSITORIES_MESSAGE);
        });

        it('should render SPARQL page without repositories via navigation menu', () => {
            // Given, there are no repositories
            HomeSteps.visit();
            // When I open the SPARQL page via the navigation menu
            MainMenuSteps.clickOnSparqlMenu();
            // Then I see that there are no repositories
            validateSparqlPageRestrictedWith(NO_REPOSITORIES_MESSAGE);
        });
    });
});

function validateSparqlPageRestrictedWith(message) {
    SparqlSteps.getQueryArea().should('not.exist');
    PageRestrictionsSteps.getMessages().should('have.length', 1);
    PageRestrictionsSteps.getMessage(message).should('be.visible');
}
