import SparqlSteps from "../../steps/sparql-steps";
import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {ErrorSteps} from "../../steps/error-steps";

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
    ErrorSteps.verifyNoConnectedRepoMessage();
}
