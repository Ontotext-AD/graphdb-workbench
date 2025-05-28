const VIEW_URL = '/graphs-visualizations';
const VALID_RESOURCE = 'USRegion';

export class VisualGraphSteps {

    static visit() {
        cy.visit(VIEW_URL);
    }

    static verifyPageLoaded() {
        cy.get('.repository-errors').should('not.be.visible');
    }

    static openUSRegionUri() {
        cy.visit('/graphs-visualizations?uri=http:%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23USRegion');
    }

    static openDryWineUri() {
        cy.visit('/graphs-visualizations?uri=http:%2F%2Fwww.w3.org%2FTR%2F2003%2FPR-owl-guide-20031209%2Fwine%23Dry');
    }

    static getSavedGraphsArea() {
        return this.getGraphConfigSearchPanel().find('h3').contains('Saved graphs');
    }

    static openNodeLabelGraph() {
        cy.visit('/graphs-visualizations?uri=http:%2F%2Fexample.com%2Fnode1');
        // Wait for at least one predicate to be displayed, to ensure that the visual graph is open and ready for testing.
        VisualGraphSteps.getPredicates().should('contain', 'connectedTo');
    }

    static verifyUrl() {
        cy.url().should('include', `${Cypress.config('baseUrl')}${VIEW_URL}`);
    }

    static getPage() {
        return cy.get('.visual-graph-view');
    }

    static updateGraphConfiguration(namedGraph) {
        cy.get('[data-cy="save-or-update-graph"]').click()
            .get('[id="wb-graphviz-savegraph-name"]').type(namedGraph)
            .get('[id="wb-graphviz-savegraph-submit"]').should('be.visible').click();
        cy.get('.toast').contains('Saved graph ' + namedGraph + ' was saved');
    }

    static deleteSavedGraph(renamedGraph) {
        cy.contains('td', renamedGraph).parent().within(() => {
            cy.get('[data-cy="delete-saved-graph"]').should('be.visible').click();
        });
        VisualGraphSteps.confirmDelete();
    }

    static deleteGraphConfig(graphConfigName) {
        cy.contains('td', graphConfigName).parent().within(() => {
            cy.get('[data-cy="delete-graph-config"]').should('be.visible').click();
        });
        VisualGraphSteps.confirmDelete();
    }

    static confirmDelete() {
        cy.get('.modal-footer .confirm-btn').should('be.visible').click();
        cy.get('.modal').should('not.exist');
    }

    // ============================

    // Visual graph home view access

    static getSearchField() {
        return this.getPage().find('.search-rdf-resources input:visible');
    }

    static getGraphVisualizationPane() {
        return cy.get('.graph-visualization');
    }

    static searchFor(resource, fullName) {
        this.getSearchField().type(resource);
        this.getAutocompleteToast().should('not.exist');
        cy.get('.result-item.active').should('contain', fullName).click();
    }

    static getAutocompleteToast() {
        return cy.get('.autocomplete-toast a');
    }

    static getGraphVisualizationNodes() {
        return this.getGraphVisualizationPane().find('.node-wrapper');
    }

    static searchForResourceAndOpen(resource, fullName) {
        VisualGraphSteps.getSearchField().should('be.visible');
        VisualGraphSteps.searchFor(resource, fullName);
        VisualGraphSteps.getGraphVisualizationPane().should('be.visible');
        VisualGraphSteps.getGraphVisualizationNodes().should('be.visible');
    }

    static searchForResource(resource) {
        // verify that the easy graph search has occured and a valid resource was input and only
        // after that execute the next operation
        cy.searchEasyVisualGraph(resource)
            .then(() => {
                // Verify redirection to existing visual graph
                cy.waitUntil(() =>
                    cy.get('.graph-visualization')
                        .find('.nodes-container')
                        .then((nodesContainer) => nodesContainer))
                    .then(() => {
                        this.getNodes();
                    });
            });
    }

    static getTargetNodeElement() {
        return cy.get(`[id="http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#${VALID_RESOURCE}"] circle`).should('be.visible');
    }

    static getTargetNode() {
        // The wait is needed because mouseover event will result in
        // pop-up of menu icons only if nodes are not moving
        return this.getTargetNodeElement().wait(5000);
    }

    static getNodes() {
        return cy.get('.node-wrapper').should('be.visible');
    }

    static getNode(nodeId) {
        return cy.get(`.node-wrapper[id="${nodeId}"]`);
    }

    static getNodeLabel(nodeId) {
        return this.getNode(nodeId).find('.node-label-body div');
    }

    static getPredicates() {
        return cy.get('.predicate');
    }

    static getNodeInfoPanel() {
        return cy.get('.rdf-info-side-panel .tab-content');
    }

    static getCircleOfNodeByNodeId(nodeId) {
        return cy.get(`[id="${nodeId}"] circle`);
    }

    static getLineBetweenNodesById(narrowId) {
        return cy.get(`[id="${narrowId}"] line`);
    }

    static getSettingsPanel() {
        return cy.get('.rdf-info-side-panel .filter-sidepanel');
    }

    static getSidePanelCloseButton() {
        return cy.get('');
    }

    static getSidePanelContent() {
        return cy.get('.rdf-side-panel-content');
    }

    // Visual graph settings form field access

    static openPredicatesTab() {
        cy.get('.predicates-tab').should('be.visible').click();
    }

    static showPreferredTypes(enable) {
        const command = enable ? 'check' : 'uncheck';
        this.getShowPreferredTypesOnlyCheckbox()[command]();
    }

    static toggleInferredStatements(enable) {
        this.openVisualGraphSettings();
        this.getSettingsPanel().should('be.visible');
        const command = enable ? 'check' : 'uncheck';
        this.getIncludeInferredStatementsCheckbox()[command]();
        this.saveSettings();
    }

    static getLinksNumberField() {
        // This element could not be checked with 'be.visible' because it has
        // CSS property: 'position: fixed' and its being covered by another element
        return cy.get('.input-number');
    }

    static getSaveSettingsButton() {
        return cy.get('.save-settings-btn').scrollIntoView().should('be.visible');
    }

    static saveSettings() {
        this.getSaveSettingsButton().click();
    }

    static getResetSettingsButton() {
        return cy.get('.reset-settings').scrollIntoView().should('be.visible');
    }

    static resetSettings() {
        this.getResetSettingsButton().click();
    }

    static getSameAsCheckbox() {
        return cy.get('#sameAsCheck').should('be.visible');
    }

    static getIncludeInferredStatementsCheckbox() {
        return cy.get('.include-inferred-statements').should('be.visible');
    }

    static getShowPredicateLabelsCheckbox() {
        return cy.get('.show-predicate-labels').should('be.visible');
    }

    static getPreferredTypesField() {
        return cy.get('.preferred-types input').scrollIntoView().should('be.visible');
    }
    static getShowPreferredTypesOnlyCheckbox() {
        return cy.get('.show-preferred-types-only').should('be.visible');
    }

    static getIgnoredTypesField() {
        // This element could not be checked with 'be.visible' because it has
        // CSS property: 'position: fixed' and its being covered by another element
        return cy.get('.ignored-types input');
    }

    static getPreferredPredicatesField() {
        return cy.get('.preferred-predicates input').should('be.visible');
    }

    static getShowPreferredPredicatesOnlyCheckbox() {
        return cy.get('.show-preferred-predicates-only').should('be.visible');
    }

    static getIgnoredPredicatesField() {
        // This element could not be checked with 'be.visible' because it has
        // CSS property: 'position: fixed' and its being covered by another element
        return cy.get('.ignored-predicates input');
    }

    static getCreateCustomGraphLink() {
        return cy.get('.create-graph-config').should('be.visible');
    }

    static getGraphConfigName() {
        return cy.get('.graph-config-name').should('be.visible');
    }

    static typeGraphConfigName(name) {
        this.getGraphConfigName().type(name);
    }

    static getSaveConfigButton() {
        return cy.get('.btn-save-config');
    }

    static saveConfig() {
        this.getSaveConfigButton().click();
    }

    static getCanceSaveConfigButton() {
        return cy.get('.btn-cancel-save-config');
    }

    static cancelSaveConfig() {
        this.getCanceSaveConfigButton().click();
    }

    static getGraphConfigurationsArea() {
        return cy.get('.graph-configurations');
    }

    static getGraphConfigs() {
        return this.getGraphConfigurationsArea().find('.graph-configurations-list tr');
    }

    static getGraphConfig(name) {
        return this.getGraphConfigs().contains(name);
    }

    static openGraphConfig(name) {
        this.getGraphConfig(name).click();
    }

    static editConfig(name) {
        this.getGraphConfig(name).closest('tr').find('.btn-edit-config').click();
    }

    static deleteConfig(name) {
        this.getGraphConfig(name).closest('tr').find('.delete-config').click();
    }

    static getGraphConfigSearchPanel() {
        return cy.get('.search-bar');
    }

    static getGraphConfigSearchPanelName() {
        return this.getGraphConfigSearchPanel().find('.graph-config-name');
    }

    // Node actions

    static collapseGraph() {
        cy.get('.menu-events .collapse-icon circle').should('be.visible').click();
    }

    static expandGraph() {
        cy.get('.menu-events .expand-icon circle').should('be.visible').click();
    }

    static removeNode() {
        cy.get('.menu-events .close-icon circle').click({force: true});
    }

    // Visual graph toolbar actions

    static openVisualGraphSettings() {
        return cy.get('.toolbar-holder').should('be.visible')
            .find('.visual-graph-settings-btn')
            .should('be.visible').click();
    }

    static openVisualGraphHome() {
        cy.get('.toolbar-holder').should('be.visible')
            .find('.return-home-btn').should('be.visible').click();
    }

    static updateLinksLimitField(value) {
        return this.getLinksNumberField().invoke('val', value).trigger('change', {force: true});
    }

    static getNextPageButton() {
        return cy.get(`.btn-next-page`);
    }

    static goToNextPage() {
        this.getNextPageButton().click();
    }

    static getPreviousPageButton() {
        return cy.get(`.btn-previous-page`);
    }

    static goToPreviousPage() {
        this.getPreviousPageButton().click();
    }

    static getConfigWizardTab(index) {
        return cy.get(`.page-${index}-link`);
    }

    static openConfigWizardTab(index) {
        this.getConfigWizardTab(index).click();
    }

    static getStartModes() {
        return cy.get('.start-mode');
    }

    static getStartMode(type) {
        return this.getStartModes().filter(`.${type}`);
    }

    static getStartModeSelector(type) {
        return this.getStartMode(type).find('input');
    }

    static selectStartMode(type) {
        this.getStartMode(type).click();
    }

    static getQueryEditor() {
        return cy.get(".yasqe:visible");
    }

    static getPredefinedQuerySamples() {
        return cy.get('.predefined-queries .predefined-query');
    }

    static selectPredefinedQuerySample(index) {
        this.getPredefinedQuerySamples().eq(index).click();
    }

    static getUserQuerySamples() {
        return cy.get('.user-queries .user-query');
    }

    static selectUserQuerySample(index) {
        this.getUserQuerySamples().eq(index).click();
    }

    static getHelpInfoBox() {
        return cy.get('.help-box');
    }

    static getStartNodeSelectorComponent() {
        return cy.get('.start-node-selector');
    }

    static getStartNodeSelectorField() {
        return cy.get('.view-res-input');
    }

    static getResultItemField() {
        return cy.get('#auto-complete-results-wrapper .result-item');
    }

    static selectStartNode(uri, index) {
        cy.get('.graph-config-wizard-body .view-res-input').type(uri)
            .closest('.start-node-selector')
            .find('#auto-complete-results-wrapper .result-item').eq(index).click();
    }

    static getSelectedStartNodeUri() {
        return this.getStartNodeSelectorComponent().find('.selected-node code');
    }

    static getPreviewQueryResultsButton() {
        return cy.get('.btn-preview-query-results');
    }

    static previewQueryResults() {
        this.getPreviewQueryResultsButton().click();
    }

    static editQuery() {
        cy.get('.btn-show-query-editor').click();
    }

    static getRevertQueryButton() {
        return cy.get('.btn-revert-query');
    }

    static revertQuery() {
        this.getRevertQueryButton().click();
    }

    static getMainGroupElement() {
         return cy.get('#classChart #main-group');
    }
}
