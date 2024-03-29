export class ClusterPageSteps {
    static visit() {
        cy.visit('/cluster');
    }

    static getClusterPage() {
        return cy.get('.cluster-view');
    }

    static getCreateClusterButton() {
        return cy.get('.cluster-zone');
    }

    static createCluster() {
        this.getCreateClusterButton().click();
    }

    static getClusterDeleteButton() {
        return cy.get('.delete-cluster-btn');
    }

    static deleteCluster() {
        this.getClusterDeleteButton().click();
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
}
