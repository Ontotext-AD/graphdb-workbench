export class AutocompleteSteps {

    static getAutocompleteSwitch() {
        return cy.get('.autocomplete-switch');
    }

    static getSuccessStatusElement() {
        return cy.get('.autocomplete-status').find('.tag.tag-success.ng-binding');
    }
}
