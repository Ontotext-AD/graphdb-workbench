import {BaseSteps} from "../base-steps";

export class AutocompleteSteps extends BaseSteps {

    static visit() {
        cy.visit('/autocomplete');
    }

    static waitUntilAutocompletePageIsLoaded() {
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
        return this.getByTestId('autocomplete-page');
    }

    static getAutocompletePageContent() {
        return this.getAutocompletePage().getByTestId('autocomplete-content');
    }

    static getAutocompleteIndex() {
        return this.getAutocompletePage().find('#toggleIndex');
    }

    static getAutocompleteHeader() {
        return this.getAutocompletePageContent().getByTestId('autocomplete-header');
    }

    static getAutocompleteLabelsContainer() {
        return this.getAutocompletePage().getByTestId('autocomplete-labels-container');
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

    static addLabelAndLanguage(label, language) {
        this.getAddLabelButton().click();
        this.typeLabelIri(label);
        this.typeLabelLanguages(language);
        this.saveLabel();
    }

    static typeLabelIri(iri) {
        this.getAddLabelForm().find('#wb-autocomplete-iri').click().clear().type(iri);
    }

    static typeLabelLanguages(languages) {
        this.getAddLabelForm().find('#wb-autocomplete-languages').click().type(languages);
    }

    static getAutocompleteLabels() {
        return this.getAutocompletePage().find('#wb-autocomplete-labels');
    }

    static getLabelRows() {
        return this.getAutocompleteLabels().find('.wb-autocomplete-labels-row')
    }

    static getTableRows() {
        return cy.get('.wb-autocomplete-labels-row');
    }

    static getSuccessStatusElement() {
        return cy.get('.autocomplete-status').find('.tag.tag-success.ng-binding');
    }

    static getAddLabelForm() {
        return cy.get('#addLabelForm');
    }

    static saveLabel() {
        cy.get('#wb-autocomplete-savegraph-submit').click();
    }

    static editLabelOnRow(rowIndex) {
        this.getTableRows().eq(rowIndex).find('.actions-bar .icon-edit').click();
    }
}
