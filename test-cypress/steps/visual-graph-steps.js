const VIEW_URL = '/graphs-visualizations';

export class VisualGraphSteps {

     static visit() {
         cy.visit(VIEW_URL);
     }

     static verifyUrl() {
         cy.url().should('include', `${Cypress.config('baseUrl')}${VIEW_URL}`);
     }

    static updateGraphConfiguration(namedGraph) {
        cy.get('[data-cy="save-or-update-graph"]').click()
            .get( '[id="wb-graphviz-savegraph-name"]').type(namedGraph)
            .get('[id="wb-graphviz-savegraph-submit"]').should('be.visible').click();
        cy.get('.toast').contains('Saved graph ' + namedGraph + ' was saved');
    }

    static deleteSavedGraph(renamedGraph) {
        cy.contains('td', renamedGraph).parent().within( () => {
            cy.get('[data-cy="delete-saved-graph"]').should('be.visible').click();
        });
        VisualGraphSteps.confirmDelete();
    }

    static deleteGraphConfig(graphConfigName) {
        cy.contains('td', graphConfigName).parent().within( () => {
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
        return cy.get('.search-rdf-resources input:visible');
    }

    static getGraphVisualizationPane() {
        return cy.get('.graph-visualization');
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

    static getPredicates() {
        return cy.get('.predicate');
    }

    static getNodeInfoPanel() {
        return cy.get('.rdf-info-side-panel .tab-content');
    }

    static getSettingsPanel() {
        return cy.get('.rdf-info-side-panel .filter-sidepanel');
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
