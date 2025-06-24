import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {AutocompleteSteps} from "../../../steps/setup/autocomplete-steps";

describe('Autocomplete with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'autocomplete-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Autocomplete page via URL with a repository selected
        AutocompleteSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Autocomplete page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnAutocomplete();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        AutocompleteSteps.getAutocompletePage().should('exist');
        AutocompleteSteps.getAutocompletePageContent().should('exist');
        AutocompleteSteps.getAutocompletePage().should('exist');
        AutocompleteSteps.getAutocompleteHeader().contains('Autocomplete for repository');
        AutocompleteSteps.getAutocompleteLabelsContainer().should('exist');
    };
})
