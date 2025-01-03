import ImportSteps from "./import-steps";

export class ImportUserDataSteps extends ImportSteps {

    static getResourcesTable() {
        return ImportSteps.getView().find('#import-user import-resource-tree');
    }

    static getHelpMessage() {
        return this.getView().find('.user-data-import-help');
    }

    static openImportTextSnippetDialog() {
        cy.get('#import-user .import-rdf-snippet-btn').click()
            // Forces the popover to disappear as it covers the modal and Cypress refuses to continue
            .trigger('mouseleave', {force: true});
        this.getModal().find('#wb-import-textarea').should('be.visible');
        return this;
    }

    static fillRDFTextSnippet(snippet) {
        this.getSnippetTextarea().type(snippet, {parseSpecialCharSequences: false}).should('have.value', snippet);
        return this;
    }

    static pasteRDFTextSnippet(snippet) {
        this.getSnippetTextarea().invoke('val', snippet).trigger('change');
    }

    static selectRDFFormat(rdfFormat) {
        cy.get('.modal-footer .import-format-dropdown').within(() => {
            cy.get('.import-format-dropdown-btn').click();
            cy.get('.dropdown-item').contains(rdfFormat).click().should('not.be.visible');
        });
        return this;
    }

    static clickImportTextSnippetButton() {
        cy.get('#wb-import-importText').click();
        return this;
    }

    static stubPostJSONLDFromURL(repositoryId) {
        cy.intercept('POST', `/rest/repositories/${repositoryId}/import/upload/url`).as('postJsonldUrl');
    }

    // ==========================================================================
    // utilities from text snippet tests
    // ==========================================================================

    static getSnippetTextarea() {
        return this.getModal().find('#wb-import-textarea');
    }

    static getImportFromDataRadioButton() {
        return this.getModal().find('#wb-import-from-data');
    }

    static getImportInDefaultGraphRadioButton() {
        return this.getModal().find('#wb-import-in-default-graph');
    }

    static getExistingDataReplacementCheckbox() {
        return this.getModal().find('#wb-import-existing-data-replacement');
    }

    static getReplacedGraphsInputField() {
        return this.getModal().find('#wb-import-replaced-graphs');
    }

    static getAddGraphToReplaceButton() {
        return this.getModal().find('#wb-import-add-graph-to-replace');
    }

    //verifies that the data has been inserted in the given graph and that the new data has replaced the old one.
    static verifyGraphData(graphName, s, p, o, c, checkForReplacedData, oldData) {
        cy.visit('/graphs');
        // wait a bit to give chance page loaded.
        cy.wait(1000);
        cy.get(`#export-graphs td a:contains(${graphName})`).click();
        cy.get(`.uri-cell:contains(${s})`).should('be.visible');
        cy.get(`.uri-cell:contains(${p})`).should('be.visible');
        cy.get(`.uri-cell:contains(${o})`).should('be.visible');
        cy.get(`.uri-cell:contains(${c})`).should('be.visible');

        if (checkForReplacedData) {
            cy.get(`.uri-cell:contains(${oldData})`).should('not.exist');
        }
    }

    static importFromData(shouldReplaceGraph, graphToReplace) {
        this.getImportFromDataRadioButton().click();
        if (shouldReplaceGraph) {
            this.getExistingDataReplacementCheckbox().click();
            this.getReplacedGraphsInputField().type(graphToReplace);
            this.getAddGraphToReplaceButton().click();
            this.getReplaceGraphConfirmationCheckbox().click();
        }
        this.getImportSettingsImportButton().click();
        this.getImportSuccessMessage().should('be.visible').and('contain', 'Imported successfully in')
    }

    static importInTheDefaultGraph(shouldReplaceGraph) {
        this.getImportInDefaultGraphRadioButton().click();
        if (shouldReplaceGraph) {
            this.getExistingDataReplacementCheckbox().click();
            this.getReplaceGraphConfirmationCheckbox().click();
        }
        this.getImportSettingsImportButton().click();
        this.getImportSuccessMessage().should('be.visible').and('contain', 'Imported successfully in')
    }

    static importInNamedGraph(shouldReplaceGraph, graph) {
        this.getImportInNamedGraphRadioButton().click();
        this.getNamedGraphInputField().type(graph);
        if (shouldReplaceGraph) {
            this.getExistingDataReplacementCheckbox().click();
            this.getReplaceGraphConfirmationCheckbox().click();
        }
        this.getImportSettingsImportButton().click();
        this.getImportSuccessMessage().should('be.visible').and('contain', 'Imported successfully in')
    }

    static getImportFromDataRadioButton() {
        return cy.get('.from-data-btn');
    }

    static getImportInDefaultGraphRadioButton() {
        return cy.get('.default-graph-btn');
    }

    static getImportInNamedGraphRadioButton() {
        return cy.get('.named-graph-btn');
    }

    static getExistingDataReplacementCheckbox() {
        return cy.get('.existing-data-replacement');
    }

    static getReplacedGraphsInputField() {
        return cy.get('.replaced-graphs-input');
    }

    static getAddGraphToReplaceButton() {
        return cy.get('.add-graph-btn');
    }

    static getImportSettingsImportButton() {
        return cy.get('.import-settings-import-button');
    }

    static getReplaceGraphConfirmationCheckbox() {
        return cy.get('.graph-replace-confirm-checkbox');
    }

    static getNamedGraphInputField() {
        return cy.get('.named-graph-input');
    }

    static getImportSuccessMessage() {
        return cy.get('.text-success');
    }

    static getDeleteImportEntryButton() {
        return cy.get('.icon-trash');
    }
}
