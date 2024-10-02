export class ClusterListSteps {

    static getClusterUpdateModal() {
        return cy.get('cluster-list');
    }

    static clickAddNodeButton() {
        return this.getAddNodeButton().click();
    }

    static getAddNodeButton() {
        return this.getClusterUpdateModal().find('.add-node-btn');
    }

    static getAdvancedOptions() {
        return this.getClusterUpdateModal().find('.advanced-options-btn');
    }

    static getSaveAlert() {
        return cy.get('.alert-warning');
    }

    static getNodes() {
        return cy.get('.cluster-group tbody tr.node');
    }

    static getNodeByIndex(index) {
        return ClusterListSteps.getNodes().eq(index);
    }

    static getNodeByEndpoint(endpoint) {
        return ClusterListSteps.getNodes().filter(`[data-endpoint="${endpoint}"]`);
    }

    static getNodeLocationByEndpoint(endpoint) {
        return ClusterListSteps.getNodeByEndpoint(endpoint).find('.location-cell');
    }

    static getNodeIndexByEndpoint(endpoint) {
        return ClusterListSteps.getNodeByEndpoint(endpoint).find('.index-cell');
    }

    static getNodeStatusByEndpoint(endpoint) {
        return ClusterListSteps.getNodeByEndpoint(endpoint).find('.status-cell').invoke('text').then((text) => text.trim());
    }

    static clickDeleteNodeButtonByEndpoint(endpoint) {
        ClusterListSteps.getNodeByEndpoint(endpoint)
            .find('.delete-node-btn')
            .click();
    }

    static clickReplaceNodeButtonByEndpoint(endpoint) {
        ClusterListSteps.getNodeByEndpoint(endpoint)
            .find('.replace-node-btn')
            .click();
    }

    static enterNodeEndpoint(endpoint) {
        cy.get('.edit-node-row .location-cell textarea[name="location"]')
            .clear()
            .type(endpoint);
    }

    static clickSaveNodeButton() {
        cy.get('.save-rule-btn').click();
    }

    static clickCancelNodeButton() {
        cy.get('.edit-node-row .cancel-node-replace-btn').click();
    }

    static getEditNodeErrorMessages() {
        return cy.get('.edit-node-row .error-message');
    }

    static getSuggestionsDropdown() {
        return cy.get('.edit-node-row .autocomplete-dropdown');
    }

    static isDeleteNodeButtonEnabledByEndpoint(endpoint) {
        return ClusterListSteps.getNodeByEndpoint(endpoint)
            .find('.delete-node-btn')
            .then((button) => !button.is(':disabled'));
    }

    static getEditNodeRow() {
        return cy.get('.cluster-group tbody tr.edit-node-row');
    }

    static getOkButton() {
        return cy.get('#wb-update-cluster-group-submit');
    }

    static clickOkButton() {
        return this.getOkButton().click();
    }

    static getAddNodeRow() {
        return cy.get('.cluster-group tbody tr.add-node-row');
    }
    static enterNewNodeEndpoint(endpoint) {
        return this.getAddNodeButton().find('textarea[name="location"]')
            .clear()
            .type(endpoint);
    }
}
