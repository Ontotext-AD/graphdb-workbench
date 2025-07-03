import HomeSteps from '../../steps/home-steps';
import {RdfResourceSearchSteps} from "../../steps/rdf-resource-search-steps";
import ImportSteps from "../../steps/import/import-steps";
import {BaseSteps} from "../../steps/base-steps";
import {BrowserStubs} from "../../stubs/browser-stubs";

const FILE_TO_IMPORT = 'wine.rdf';

describe('RDF resource search', () => {
    let repositoryId;
    beforeEach(() => {
        cy.viewport(1280, 1000);
        repositoryId = 'rdf-resource-search-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.initializeRepository(repositoryId);
        cy.enableAutocomplete(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Search button should not be present when no repo is selected', () => {
        HomeSteps.visitAndWaitLoader();
        RdfResourceSearchSteps.getComponent().should('not.exist');
    });

    it('Search should only be triggered from the home page when a repository is selected', () => {
        // When: I visit home page with selected repository
        cy.presetRepository(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // And: I click the button
        RdfResourceSearchSteps.clickOnShowViewResourceMessageButton();
        // Then: I should be able to type some text in the input on home page
        HomeSteps.getRdfResourceSearchInput().type('hasPos');
        // And: the autocomplete dropdown should become visible
        HomeSteps.getAutocompleteResultsContainer().should('be.visible');
        // When: I click the close button
        HomeSteps.closeRdfResourceSearchBox();
        // The input should be cleared
        HomeSteps.getRdfResourceSearchInput().should('have.value', '');
    });

    it('should be visible when a repository is selected and the user is not on the Home page', () => {
        // When: There is a repository selected and I visit a page other than home.
        cy.presetRepository(repositoryId);
        ImportSteps.visit();
        // Then: Search rdf button should be visible
        RdfResourceSearchSteps.getOpenButton().should('be.visible');

        // When: I click the button
        RdfResourceSearchSteps.openRdfSearchBox();
        // Then: I should be able to type some text in the input
        RdfResourceSearchSteps.getRDFResourceSearchInput().type('hasPos');
        // And: the autocomplete dropdown should become visible
        RdfResourceSearchSteps.getAutocompleteResults().should('be.visible');

        // When: I close the RDF search box
        RdfResourceSearchSteps.closeRDFSearchBox();
        // And: open again the search box
        RdfResourceSearchSteps.openRdfSearchBox();
        // Then: The input should have value 'hasPos'
        RdfResourceSearchSteps.getRDFResourceSearchInput().should('have.value', 'hasPos');
        // And: the autocomplete dropdown should become visible
        RdfResourceSearchSteps.getAutocompleteResults().should('be.visible');

        // When: I press 'escape'
        BaseSteps.typeEscapeKey();
        // Then: Search box should not be visible
        RdfResourceSearchSteps.getRDFResourceSearchInput().should('not.be.visible');
    });

    it('Search should be persisted on page reload', () => {
        // Given: There is a repository selected and I visit a page other than home.
        cy.presetRepository(repositoryId);
        ImportSteps.visit();
        BrowserStubs.stubWindowOpen();
        // When: I open the search resource component
        RdfResourceSearchSteps.openRdfSearchBox();
        //Then: I should be able to type some text in the input
        RdfResourceSearchSteps.getRDFResourceSearchInput().type('hasPos')
            .then(() => {
                // When: I select option from suggestions
                RdfResourceSearchSteps.clickOnAutocompleteSuggestionByPartialText('hasPos')
                    .then(() => {
                        // Then: Search result should be opened in new window
                        cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('have.been.calledWithMatch', `resource?uri=http%3A%2F%2Fwww.w3.org%2Fns%2Forg%23hasPost`, "_blank");
                    });
            });

        // When: I revisit the home page
        ImportSteps.visit();
        // And: I open again the search box
        RdfResourceSearchSteps.openRdfSearchBox();
        // Then: The input should have value 'hasPos' from previous search
        RdfResourceSearchSteps.getRDFResourceSearchInput().should('have.value', 'hasPos');
        // And: the autocomplete dropdown should become visible
        RdfResourceSearchSteps.getAutocompleteResults().should('be.visible');

        // When: I press 'escape'
        BaseSteps.typeEscapeKey();
        // Then: Search box should not be visible
        RdfResourceSearchSteps.getRDFResourceSearchInput().should('not.be.visible');
    });

    it('Should test RDF resource search box', () => {
        // Given: I have a repository with RDF data
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        // And: I visit the home page
        HomeSteps.visitAndWaitLoader();

        // When: I click on the RDF resource search button
        RdfResourceSearchSteps.clickOnShowViewResourceMessageButton();
        // Then: The input for RDF resource search should be visible (This is the legacy component used prior to the migration)
        HomeSteps.getRdfResourceSearchInput().should('have.attr', 'placeholder', 'Search RDF resources...')
            .and('be.focused');

        //Navigate away from the Homepage, to be able to test the new resource search box
        HomeSteps.visitAndWaitLoader();
        BrowserStubs.stubWindowOpen();
        // When: I click on the RDF resource search button
        RdfResourceSearchSteps.clickOnShowViewResourceMessageButton();
        // Then: The input for RDF resource search should be visible (This is the legacy component used prior to the migration)
        HomeSteps.getRdfResourceSearchInput().should('have.attr', 'placeholder', 'Search RDF resources...')
            .and('be.focused');

        // When: I type some text in the input
        HomeSteps.getRdfResourceSearchInput().type('Dry');
        // Then: The autocomplete results should be visible
        HomeSteps.getAutocompleteSuggestion().should('be.visible')
            .and('have.length', 7);

        // When: The table display button is active
        HomeSteps.getTableDisplayButton().click();
        // And: click on some suggestion
        HomeSteps.getAutocompleteSuggestionByPartialText('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#').click();
        // Then: The clicked suggestion should be opened in new window
        cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('have.been.calledWithMatch', `resource?uri=http%3A%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23Dry`);

        // When: The visual display button is active
        HomeSteps.getVisualDisplayButton().click();
        // And: click on some suggestion
        HomeSteps.getAutocompleteSuggestionByPartialText('http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#').click();
        // Then: The clicked suggestion should be opened in new window
        cy.get(BrowserStubs.WINDOW_OPEN_ALIAS()).should('have.been.calledWithMatch', `graphs-visualizations?uri=http%3A%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23Dry`);
    });
});
