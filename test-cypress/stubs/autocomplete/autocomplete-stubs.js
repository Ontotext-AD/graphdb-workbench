import {Stubs} from "../stubs";

export class AutocompleteStubs extends Stubs {
    static spyAutocompleteStatus() {
        cy.intercept('GET', '/rest/autocomplete/enabled').as('autocompleteStatus');
    }
}
