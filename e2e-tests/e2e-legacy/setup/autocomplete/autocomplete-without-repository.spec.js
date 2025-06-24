import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {AutocompleteSteps} from "../../../steps/setup/autocomplete-steps";

describe('Autocomplete without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Autocomplete page via URL without a repository selected
        AutocompleteSteps.visit();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Autocomplete page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnAutocomplete();
        // Then,
        verifyInitialStateWithoutSelectedRepository()
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        ErrorSteps.verifyNoConnectedRepoMessage();
        AutocompleteSteps.getAutocompletePage().should('exist');
        AutocompleteSteps.getAutocompletePageContent().should('not.exist');
    };
})
