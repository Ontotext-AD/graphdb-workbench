import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SparqlTemplatesSteps} from "../../../steps/setup/sparql-templates-steps";

describe('Sparql templates without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Sparql templates page via URL without a repository selected
        SparqlTemplatesSteps.visit();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Sparql templates page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSparqlTemplates();
        // Then,
        verifyInitialStateWithoutSelectedRepository()
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        ErrorSteps.verifyNoConnectedRepoMessage();
        SparqlTemplatesSteps.getSparqlTemplatesPage().should('exist');
        SparqlTemplatesSteps.getSparqlTemplatesContent().should('not.exist');
        SparqlTemplatesSteps.getSparqlTemplatesCreateLink().should('not.exist');
        SparqlTemplatesSteps.getNoSparqlTemplatesMessage().should('not.exist');
    };
})
