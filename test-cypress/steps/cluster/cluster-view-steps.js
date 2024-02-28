export class ClusterViewSteps {

   static getNodes() {
        return cy.get('.id-host-background').parent().parent();
    }

    static getNode(host) {
       return ClusterViewSteps.getNodes().contains(host).parent().parent();
    }

    static getNodeInfoText(host) {
        return ClusterViewSteps.getNode(host).find('.node-info-fo');
    }
}
