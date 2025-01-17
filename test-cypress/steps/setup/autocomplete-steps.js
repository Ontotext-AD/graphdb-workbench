export class AutocompleteSteps {

    static visit() {
        cy.visit('/autocomplete');
    }

    static waitUntilAutocompletePageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.exist');

        // Repository is active
        cy.get('.repository-errors').should('not.be.visible');

        // No warnings should be present
        this.getAutocompletePage().should(($autocomplete) => {
            // Ensure the container exists and is visible
            expect($autocomplete).to.be.visible;
            // Assert no warning exists inside the container
            expect($autocomplete.find('.alert-warning')).to.not.be.visible;
        });

        this.getAutocompleteIndex().should('be.visible');
    }

    static getAutocompletePage() {
        return cy.get('#autocomplete');
    }

    static getAutocompleteIndex() {
        return this.getAutocompletePage().find('#toggleIndex');
    }

    static getAutocompleteHeader() {
        return this.getAutocompleteIndex().find('.autocomplete-header');
    }

    static getAutocompleteSwitch() {
        return this.getAutocompleteIndex().find('.autocomplete-switch');
    }

    static getAutocompleteStatus() {
        return this.getAutocompleteIndex().find('.autocomplete-status');
    }

    static getBuildButton() {
        return this.getAutocompleteIndex().find('.build-index-btn');
    }

    static getToggleIRIButton() {
        return this.getAutocompletePage().find('#toggleIRIs');
    }

    static getAddLabelButton() {
        return this.getAutocompletePage().find('#wb-autocomplete-addLabel');
    }

    static getAutocompleteLabels() {
        return this.getAutocompletePage().find('#wb-autocomplete-labels');
    }

    static getSuccessStatusElement() {
        return cy.get('.autocomplete-status').find('.tag.tag-success.ng-binding');
    }
}
