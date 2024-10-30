export class ClusterConfigurationSteps {
    static getClusterConfig() {
        return cy.get('.cluster-configuration-panel');
    }

    static getDeleteClusterButton() {
        return this.getClusterPropertiesTabContent().find('.delete-cluster-btn');
    }

    static deleteCluster() {
        this.getDeleteClusterButton().click();
    }

    static getTabs() {
        return cy.get('.nav-tabs.configuration-tabs .nav-item');
    }

    static getActiveTab() {
        return this.getTabs().find('.active');
    }

    static selectTab(index) {
        return this.getTabs().eq(index).click();
    }

    static getClusterPropertiesTabContent() {
        return cy.get('cluster-properties');
    }

    static getClusterNodesTabContent() {
        return cy.get('cluster-nodes');
    }

    static getMultiRegionTabContent() {
        return cy.get('multi-region');
    }

    static getEditPropertiesButton() {
        return this.getClusterPropertiesTabContent().find('.edit-properties-btn');
    }

    static editProperties() {
        return this.getEditPropertiesButton().click();
    }

    static getModal() {
        return cy.get('.modal-content');
    }

    static getCancelButton() {
        return this.getModal().find('.cancel-cluster-configuration-btn');
    }

    static cancel() {
        this.getCancelButton().click();
    }

    static getSaveButton() {
        return this.getModal().find('.save-cluster-configuration-btn');
    }

    static save() {
        this.getSaveButton().click();
    }

    static getFieldByName(fieldName) {
        return this.getModal().find(`input[name="${fieldName}"]`);
    }

    static setFieldValue(fieldName, value) {
        this.getFieldByName(fieldName).clear().type(value);
    }

    static getFieldError(fieldName) {
        return this.getFieldByName(fieldName).siblings('.form-control-feedback');
    }

    static verifyFieldError(fieldName, errorText) {
        this.getFieldError(fieldName).should('contain.text', errorText);
    }

    static getNodesList() {
        return this.getClusterNodesTabContent().find('.nodes-list li');
    }

    static getNodesListHeader() {
        return this.getClusterNodesTabContent().find('.title');
    }

    static getNodeLink(index) {
        return this.getNodesList().eq(index).find('.endpoint');
    }

    static getNodeRPCAddress(index) {
        return this.getNodesList().eq(index).find('.rpc-address');
    }

    static getNodeState(index) {
        return this.getNodesList().eq(index).find('.state');
    }

    static isNodeLocal(index) {
        return this.getNodesList().eq(index).contains('(Local)');
    }

    static assertNodesCount(expectedCount) {
        this.getNodesList().should('have.length', expectedCount);
    }

    static getMultiRegionHeader() {
        return this.getMultiRegionTabContent().find('.title');
    }

    static getAddTagButton() {
        return this.getMultiRegionTabContent().find('.create-tag-btn');
    }

    static getEnableSecondaryModeButton() {
        return this.getMultiRegionTabContent().find('.enable-secondary-mode-btn');
    }

    static clickEnableSecondaryModeButton() {
        return this.getEnableSecondaryModeButton().click();
    }

    static getTagsTable() {
        return this.getMultiRegionTabContent().find('.tags-table');
    }

    static clickAddTagButton() {
        this.getAddTagButton().click();
    }

    static getTagInputField() {
        return this.getMultiRegionTabContent().find('#asciiInput');
    }

    static typeTag(tag) {
        this.getTagInputField().type(tag);
    }

    static clickSubmitTagButton() {
        this.getMultiRegionTabContent().find('.save-rule-btn').click();
    }

    static getTagsTableRows() {
        return this.getTagsTable().find('tbody tr');
    }

    static clickDeleteTagButton() {
        this.getMultiRegionTabContent().find('.delete-tag-btn').click();
    }

    static getRpcAddressInput() {
        return this.getModal().find('#rpcAddress');
    }

    static getPrimaryTagInput() {
        return this.getModal().find('#tag');
    }

    static getEnableButton() {
        return this.getModal().find('.confirm-btn');
    }

    static typeRpcAddress(address) {
        this.getRpcAddressInput().clear().type(address);
    }

    static typePrimaryTag(tag) {
        this.getPrimaryTagInput().clear().type(tag);
    }

    static clickEnableButton() {
        this.getEnableButton().click();
    }
}
