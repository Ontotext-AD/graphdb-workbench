import SparqlSteps from "../../steps/sparql-steps";
import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {PageRestrictionsSteps} from "../../steps/page-restrictions-steps.js";

const NO_REPOSITORY_MESSAGE = 'Some functionalities are not available because you are not connected to any repository.';

describe('SPARQL page without selected repository', () => {
    it('Should render SPARQL page without selected repository via URL', () => {
        // Given, I visit the SPARQL page via URL and I haven't selected a repository
        SparqlSteps.visit();
        // Then
        validateNoRepositoriesSparqlPage();
    });

    it('Should render SPARQL page without selected repository via navigation menu', () => {
        // Given, I visit the SPARQL page via navigation menu and I haven't selected a repository'
        HomeSteps.visit();
        MainMenuSteps.clickOnSparqlMenu();
        // Then
        validateNoRepositoriesSparqlPage();
    });
});

function validateNoRepositoriesSparqlPage() {
    SparqlSteps.getQueryArea().should('not.exist');
    PageRestrictionsSteps.getMessages().should('have.length', 1);
    PageRestrictionsSteps.getMessage(NO_REPOSITORY_MESSAGE).should('be.visible');
}
