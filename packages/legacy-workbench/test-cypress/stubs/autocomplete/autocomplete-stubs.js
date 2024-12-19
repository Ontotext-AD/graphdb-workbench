import {Stubs} from "../stubs";

export class AutocompleteStubs extends Stubs {
    static spyAutocompleteStatus() {
        cy.intercept('GET', '/rest/autocomplete/enabled').as('autocompleteStatus');
    }

    static stubAutocompleteEnabled(enabled = true) {
        cy.intercept('GET', '/rest/autocomplete/enabled', {
            statusCode: 200,
            body: enabled
        }).as('autocomplete-status');
    }
}
