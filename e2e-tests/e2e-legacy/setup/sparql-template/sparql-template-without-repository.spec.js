import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SparqlTemplatesSteps} from "../../../steps/setup/sparql-templates-steps";

describe('Sparql templates without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Sparql templates page via URL without a repository selected
        SparqlTemplatesSteps.visit();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Sparql templates page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSparqlTemplates();
        // Then,
        ErrorSteps.verifyNoConnectedRepoMessage();
    });
})
