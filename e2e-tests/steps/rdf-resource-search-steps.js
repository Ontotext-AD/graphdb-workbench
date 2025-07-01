import {BaseSteps} from "./base-steps";

export class RdfResourceSearchSteps extends BaseSteps {

    static getComponent() {
        return this.getByTestId('onto-rdf-search-component');
    }

    static getShowViewResourceMessageButton() {
        return this.getByTestId('onto-show-view-resource-message');
    }

    static clickOnShowViewResourceMessageButton() {
        this.getShowViewResourceMessageButton().click();
    }

    static getOpenButton() {
        return this.getByTestId('onto-open-rdf-search-button');
    }

    static clickOnRDFResourceSearch() {
        this.getOpenButton().click();
    }

    static getRDFResourceSearchInput() {
        return this.getComponent().getByTestId('rdfSearchContext');
    }

    static getCloseButton() {
        return this.getComponent().getByTestId('onto-rdf-resource-search-close-btn');
    }

    static getAutocompleteResults() {
        return this.getComponent().getByTestId('onto-autocomplete-results');
    }

    static getAutocompleteSuggestionByPartialText(partialText) {
        return this.getAutocompleteResults().getByTestId('onto-autocomplete-suggestion').contains(partialText);
    }

    static clickOnAutocompleteSuggestionByPartialText(partialText) {
        return this.getAutocompleteSuggestionByPartialText(partialText).click();
    }

    static openRdfSearchBox() {
        RdfResourceSearchSteps.clickOnRDFResourceSearch();
        RdfResourceSearchSteps.getRDFResourceSearchInput()
            .should('be.visible')
            .and('be.focused');
    }

    static closeRDFSearchBox() {
        this.getCloseButton().click();
    }
}
