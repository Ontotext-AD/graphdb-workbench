import {ModalDialogSteps} from "../modal-dialog-steps";

export class TtygAgentSettingsModalSteps extends ModalDialogSteps {

    static getSaveAgentButton() {
        return this.getDialog().find('.save-agent-settings-btn');
    }

    static saveAgent() {
        this.getSaveAgentButton().click();
    }

    // =========================
    // Form fields
    // =========================

    // Agent name

    static getAgentNameFormGroup() {
        return this.getDialog().find('.agent-name-label');
    }

    static getAgentNameField() {
        return this.getAgentNameFormGroup().find('input');
    }

    static typeAgentName(name) {
        this.getAgentNameField().type(name);
    }

    static clearAgentName() {
        this.getAgentNameField().clear();
        cy.realPress('Tab');
    }

    static getAgentNameError() {
        return this.getAgentNameFormGroup().find('.alert-danger');
    }

    // Repository ID

    static getRepositoryIdFromGroup() {
        return this.getDialog().find('.repository-id');
    }

    static getRepositorySelect() {
        return this.getRepositoryIdFromGroup().find('select');
    }

    static selectRepository(repositoryId) {
        this.getRepositorySelect().select(repositoryId);
    }

    static getRepositoryIdError() {
        return this.getRepositoryIdFromGroup().find('.alert-danger');
    }

    static verifyRepositorySelected(repositoryId) {
        this.getRepositorySelect().find('option:selected').should('have.text', repositoryId);
    }

    static verifyRepositoryOptionNotExist(repositoryId) {
        this.getRepositorySelect().each(($select) => {
            cy.wrap($select).find('option').should('not.contain.text', repositoryId);
        });
    }

    // Extraction methods

    static getExtractionMethodError() {
        return this.getDialog().find('.extraction-methods-group .extraction-method-required-error');
    }

    static getExtractionMethod(method) {
        return this.getDialog().find(`#${method}_method_heading`);
    }

    static getSelectedExtractionMethods() {
        return this.getDialog().find('.extraction-method-heading.selected');
    }

    static getSelectedExtractionMethod(index) {
        return this.getSelectedExtractionMethods().eq(index);
    }

    static getExtractionMethodPanel(method) {
        return this.getDialog().find(`#${method}_method_content`).find('.extraction-method-options');
    }

    // SPARQL extraction method

    static enableSparqlExtractionMethod() {
        this.getExtractionMethod('sparql_search').find('.extraction-method-toggle label').click();
    }

    static disableSparqlExtractionMethod() {
        this.getExtractionMethod('sparql_search').find('.extraction-method-toggle label').click();
    }

    static toggleSparqlExtractionMethodPanel() {
        this.getExtractionMethod('sparql_search').find('.panel-toggle-link').click();
    }

    static getSparqlExtractionMethodPanel() {
        return this.getExtractionMethodPanel('sparql_search');
    }

    static getSparqlExtractionMethodError() {
        return this.getSparqlExtractionMethodPanel().find('.sparql-method-option-required-error.alert-danger');
    }

    static selectSparqlMethodOntologyGraph() {
        this.getSparqlExtractionMethodPanel().find('.ontology-graph-option input[type=radio]').click();
    }

    static getSparqlMethodOntologyGraphField() {
        return this.getSparqlExtractionMethodPanel().find('#ontologyGraph');
    }

    static clearSparqlMethodOntologyGraphField() {
        return this.getSparqlMethodOntologyGraphField().clear();
    }

    static typeSparqlMethodOntologyGraphField(value) {
        return this.getSparqlMethodOntologyGraphField().type(value);
    }

    static selectSparqlMethodSparqlQuery() {
        this.getSparqlExtractionMethodPanel().find('.sparql-query-option input[type=radio]').click();
    }

    static getSparqlMethodSparqlQueryField() {
        return this.getSparqlExtractionMethodPanel().find('#sparqlQuery');
    }

    static clearSparqlMethodSparqlQueryField() {
        return this.getSparqlMethodSparqlQueryField().clear();
    }

    static typeSparqlMethodSparqlQueryField(value) {
        // disabled the parsing of special character sequences because the value is a SPARQL query and may contain special characters
        return this.getSparqlMethodSparqlQueryField().type(value, {parseSpecialCharSequences: false});
    }

    static getAddMissingNamespacesCheckbox() {
        return cy.get('#addMissingNamespaces');
    }

    static toggleAddMissingNamespacesCheckbox() {
        this.getAddMissingNamespacesCheckbox().click();
    }

    // FTS extraction method

    static enableFtsExtractionMethod() {
        this.getExtractionMethod('fts_search').find('.extraction-method-toggle label').click();
    }

    static disableFtsExtractionMethod() {
        this.getExtractionMethod('fts_search').find('.extraction-method-toggle label').click();
    }

    static toggleFTSExtractionMethodPanel() {
        this.getExtractionMethod('fts_search').find('.panel-toggle-link').click();
    }

    static getMissingRepositoryIdErrorInFtsSearchPanel() {
        return this.getExtractionMethodPanel('fts_search').find('.missing-repositoryid-error');
    }

    static getFtsDisabledHelp() {
        return this.getExtractionMethodPanel('fts_search').find('.fts-disabled-message');
    }

    static getFtsSearchMaxTriplesFormGroup() {
        return this.getExtractionMethodPanel('fts_search').find('.max-triples');
    }

    // Similarity search method

    static enableSimilaritySearchMethodPanel() {
        this.getExtractionMethod('similarity_search')
            .find('.extraction-method-toggle input[type="checkbox"]')
            .should('not.be.checked')
            .siblings('label')
            .click();
    }

    static disableSimilaritySearchMethodPanel() {
        this.getExtractionMethod('similarity_search')
            .find('.extraction-method-toggle input[type="checkbox"]')
            .should('be.checked') // Ensure the checkbox is checked
            .siblings('label')
            .click();
    }

    static toggleSimilaritySearchMethodPanel() {
        this.getExtractionMethod('similarity_search').find('.panel-toggle-link').click();
    }

    static getSimilaritySearchIndexMissingHelp() {
        return this.getExtractionMethodPanel('similarity_search').find('.no-similarity-index-message');
    }

    static clickOnSimilaritySearchIndexMissingHelp() {
        this.getSimilaritySearchIndexMissingHelp().find('a').click();
    }

    static getSimilarityIndexFormGroup() {
        return this.getExtractionMethodPanel('similarity_search').find('.similarity-index');
    }

    static getSimilarityIndexField() {
        return this.getSimilarityIndexFormGroup().find('select');
    }

    static selectSimilarityIndex(index) {
        this.getSimilarityIndexField().select(index);
    }

    static verifySimilarityIndexSelected(similarityIndex) {
        this.getSimilarityIndexField().find('option:selected').should('have.text', similarityIndex);
    }

    static getSimilarityIndexThresholdFormGroup() {
        return this.getExtractionMethodPanel('similarity_search').find('.similarity-index-threshold');
    }

    static getSimilarityIndexThresholdField() {
        return this.getSimilarityIndexThresholdFormGroup().find('#similarityIndexThreshold');
    }

    static setSimilarityIndexThreshold(value) {
        this.getSimilarityIndexThresholdField().invoke('val', value).trigger('input');
    }

    static getSimilarityIndexMaxTriplesFormGroup() {
        return this.getExtractionMethodPanel('similarity_search').find('.similarity-max-triples');
    }

    static getSimilarityIndexMaxTriplesField() {
        return this.getSimilarityIndexMaxTriplesFormGroup().find('input');
    }

    static setSimilarityIndexMaxTriples(value) {
        this.getSimilarityIndexMaxTriplesField().invoke('val', value).trigger('input');
    }

    // Retrieval method

    static enableRetrievalMethodPanel() {
        this.getExtractionMethod('retrieval_search')
            .find('.extraction-method-toggle input[type="checkbox"]')
            .should('not.be.checked')
            .siblings('label')
            .click();
    }

    static disableRetrievalMethodPanel() {
        this.getExtractionMethod('retrieval_search')
            .find('.extraction-method-toggle input[type="checkbox"]')
            .should('be.checked')
            .siblings('label')
            .click();
    }

    static toggleRetrievalMethodPanel() {
        this.getExtractionMethod('retrieval_search').find('.panel-toggle-link').click();
    }

    static getMissingRetrievalConnectorHelp() {
        return this.getExtractionMethodPanel('retrieval_search').find('.no-retrieval-connector-message');
    }

    static clickOnMissingRetrievalConnectorHelp() {
        this.getMissingRetrievalConnectorHelp().find('a').click();
    }

    static getRetrievalConnectorFormGroup() {
        return this.getExtractionMethodPanel('retrieval_search').find('.retrieval-connector');
    }

    static getRetrievalConnectorField() {
        return this.getRetrievalConnectorFormGroup().find('select');
    }

    static selectRetrievalConnector(connector) {
        this.getRetrievalConnectorField().select(connector);
    }

    static getQueryTemplateFormGroup() {
        return this.getExtractionMethodPanel('retrieval_search').find('.query-template');
    }

    static getQueryTemplateField() {
        return this.getQueryTemplateFormGroup().find('textarea');
    }

    static clearQueryTemplate() {
        this.getQueryTemplateField().clear();
    }

    static typeQueryTemplate(value) {
        // disabled the parsing of special character sequences because the value is a SPARQL query and may contain special characters
        return this.getQueryTemplateField().type(value, {parseSpecialCharSequences: false});
    }

    static getRetrievalMaxTriplesFormGroup() {
        return this.getExtractionMethodPanel('retrieval_search').find('.retrieval-connector-max-triples');
    }

    static getRetrievalMaxTriplesField() {
        return this.getRetrievalMaxTriplesFormGroup().find('input');
    }

    static setRetrievalMaxTriples(value) {
        this.getRetrievalMaxTriplesField().invoke('val', value).trigger('input');
    }

    static verifyRetrievalConnectorSelected(connectorName) {
        this.getRetrievalConnectorField().find('option:selected').should('have.text', connectorName);
    }

    // GPT model

    static getGptModelFormGroup() {
        return this.getDialog().find('.gpt-model');
    }

    static getGptModelField() {
        return this.getGptModelFormGroup().find('input');
    }

    static clearGptModel() {
        this.getGptModelField().clear();
        cy.realPress('Tab');
    }

    static getGptModelError() {
        return this.getGptModelFormGroup().find('.alert-danger');
    }

    static typeGptModel(value) {
        return this.getGptModelField().type(value);
    }

    // temperature

    static getTemperatureFormGroup() {
        return this.getDialog().find('.temperature');
    }

    static getTemperatureField() {
        return this.getTemperatureFormGroup().find('#temperature');
    }

    static getTemperatureSliderField() {
        return this.getTemperatureFormGroup().find('#temperatureSlider');
    }

    static setTemperature(value) {
        this.getTemperatureSliderField().invoke('val', value).trigger('input');
    }

    static getTemperatureWarning() {
        return this.getTemperatureFormGroup().find('.high-temperature-warning');
    }

    // Top P

    static getTopPFormGroup() {
        return this.getDialog().find('.top-p');
    }

    static getTopPField() {
        return this.getTopPFormGroup().find('#topP');
    }

    static setTopP(value) {
        this.getTopPField().invoke('val', value).trigger('input');
    }

    // Seed

    static getSeedFormGroup() {
        return this.getDialog().find('.seed');
    }

    static getSeedField() {
        return this.getSeedFormGroup().find('#seed');
    }

    static clearSeed() {
        this.getSeedField().clear();
        cy.realPress('Tab');
    }

    static typeSeed(value) {
        return this.getSeedField().type(value);
    }

    // Additional query methods
    static getIriDiscoverySearchCheckbox() {
        return cy.get('#iri_discovery_search_checkbox');
    }

    static checkIriDiscoverySearchCheckbox() {
        this.getIriDiscoverySearchCheckbox().check({force: true});
    }

    static uncheckIriDiscoverySearchCheckbox() {
        this.getIriDiscoverySearchCheckbox().uncheck({force: true});
    }

    static getAutocompleteSearchCheckbox() {
        return cy.get('#autocomplete_iri_discovery_search_checkbox');
    }

    static checkAutocompleteSearchCheckbox() {
        this.getAutocompleteSearchCheckbox().check({force: true});
    }

    static uncheckAutocompleteSearchCheckbox() {
        this.getAutocompleteSearchCheckbox().uncheck({force: true});
    }

    static getAutocompleteMaxResults() {
       return cy.get('#autocomplete_iri_discovery_search_maxNumberOfResultsPerCall');
    }

    static setAutocompleteMaxResults(number) {
        this.getAutocompleteMaxResults().type(number);
    }

    static toggleAutocompleteSearchPanel() {
        cy.get('.extraction-method-toggle .panel-toggle-link .toggle-icon').click();
    }

    static getSuggestionsList() {
        return cy.get('ul.suggestion-list li.suggestion-item');
    }

    static selectAutocompleteOption(index) {
        this.getSuggestionsList().eq(index).click();
    }

    static getAutocompleteDisabledMessage() {
        return cy.get('.autocomplete-disabled-message');
    }

    static clickOnEnableFTSSearch() {
        this.getAutocompleteDisabledMessage().find('a').click();
    }

    // System instructions

    static getSystemInstructionsFormGroup() {
        return this.getDialog().find('.system-instructions');
    }

    static getSystemInstructionsField() {
        return this.getSystemInstructionsFormGroup().find('#systemInstruction');
    }

    static getSystemInstructionsWarning() {
        return this.getSystemInstructionsFormGroup().find('.overriding-system-instructions-warning');
    }

    static clearSystemInstructions() {
        this.getSystemInstructionsField().clear();
    }

    static typeSystemInstructions(value) {
        return this.getSystemInstructionsField().type(value);
    }

    // User instructions

    static getUserInstructionsFormGroup() {
        return this.getDialog().find('.user-instructions');
    }

    static getUserInstructionsField() {
        return this.getUserInstructionsFormGroup().find('#userInstruction');
    }

    static clearUserInstructions() {
        this.getUserInstructionsField().clear();
    }

    static typeUserInstructions(value) {
        return this.getUserInstructionsField().type(value);
    }

    static toggleAdvancedSettings() {
        this.getDialog().find('.toggle-advanced-settings').click();
    }

    static getCreatingAgentLoader() {
        return this.getDialog().find('.saving-agent-loader');
    }
}
