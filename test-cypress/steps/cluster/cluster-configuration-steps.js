export class ClusterConfigurationSteps {
    static getClusterConfig() {
        return cy.get('.cluster-configuration-panel');
    }

    static closeConfigurationPanel() {
        this.getClusterConfig().find('.close').click();
    }

    static getDeleteClusterButton() {
        return this.getClusterConfig().find('.delete-cluster-btn');
    }

    static deleteCluster() {
        this.getDeleteClusterButton().click();
    }
}
