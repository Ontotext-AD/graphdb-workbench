import {BaseSteps} from "../base-steps";

export class ClusterPageSteps extends BaseSteps {
    static visit() {
        cy.visit('/cluster');
    }

    static getClusterPage() {
        return cy.get('.cluster-view');
    }

    static getNoClusterImage() {
        return this.getClusterPage().find('.no-cluster')
    }

    static getCreateClusterButton() {
        return cy.get('.cluster-zone');
    }

    static createCluster() {
        this.getCreateClusterButton().click();
    }

    static getRemoveNodesButton() {
        return cy.get('.remove-node-btn');
    }

    static removeNodes() {
        this.getRemoveNodesButton().click();
    }

    static getAddNodesButton() {
        return cy.get('.add-node-btn');
    }

    static addNodes() {
        this.getAddNodesButton().click();
    }

    static getReplaceNodesButton() {
        return cy.get('.replace-nodes-btn');
    }

    static replaceNodes() {
        this.getReplaceNodesButton().click();
    }

    static getPreviewClusterConfigButton() {
        return cy.get('.preview-cluster-config-btn');
    }

    static previewClusterConfig() {
        this.getPreviewClusterConfigButton().click();
    }

    static getLegendButton() {
        return this.getByTestId('toggle-legend-button');
    }

    static openLegend() {
        return this.getLegendButton().click();
    }

    static getLegend() {
        return cy.get('.cluster-legend-group');
    }

    static getLegendNodes() {
        return this.getLegend().find('#node-group');
    }

    static getLegendNodeStates() {
        return this.getLegend().find('.sync-statuses-group');
    }

    static getLegendLinkStates() {
        return this.getLegend().find('.link-state');
    }

    static getUpdateClusterButton() {
        return cy.get('.edit-cluster-nodes-modal-btn');
    }

    static updateCluster() {
        this.getUpdateClusterButton().click();
    }
}
