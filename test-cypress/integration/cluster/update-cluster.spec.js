import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ClusterPageSteps} from "../../steps/cluster/cluster-page-steps";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../stubs/cluster/remote-location-stubs";
import {ClusterListSteps} from "../../steps/cluster/custer-list-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import {ApplicationSteps} from "../../steps/application-steps";


describe('Cluster management', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'cluster-repo' + Date.now();
        GlobalOperationsStatusesStub.stubNoOperationsResponse(repositoryId);
    });

    it('Should be able to add', () => {
        const clusterLocations = ['http://pc-desktop:7200', 'http://pc-desktop:7201', 'http://pc-desktop:7202'];
        const nodesToAdd = ['pc-desktop:7303'];
        const urisToAdd = ['http://pc-desktop:7203'];
        ClusterStubs.stubClusterConfigByList(clusterLocations);
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubGetRemoteLocationsByList(urisToAdd);
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationCheckByAddress([{uri: 'pc-desktop:7203', rpc: 'pc-desktop:7303'}]);

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');

        // When I click on update cluster
        ClusterPageSteps.updateCluster();
        ClusterListSteps.getClusterUpdateModal().should('be.visible');

        // Then I should see the 3 nodes in the cluster
        clusterLocations.forEach((node) => {
            ClusterListSteps.getNodeByEndpoint(node).should('exist');
        });

        // When I add node
        ClusterListSteps.clickAddNodeButton();

        // Then I should see the edit node row
        ClusterListSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint
        ClusterListSteps.enterNodeEndpoint(urisToAdd[0]);

        // And I save the node
        RemoteLocationStubs.stubAddRemoteLocation();
        ClusterListSteps.clickSaveNodeButton();

        // Then I should see the new node in the list
        ClusterListSteps.getNodeByEndpoint(urisToAdd[0]).should('exist');

        //And when I confirm changes
        ClusterStubs.stubAddNodesByList(nodesToAdd);
        ClusterListSteps.clickOkButton();
        cy.wait('@response-add-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "nodes": nodesToAdd
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Nodes added successfully');
    });

    it('Should be able to delete', () => {
        const clusterLocations = ['http://pc-desktop:7200', 'http://pc-desktop:7201', 'http://pc-desktop:7202'];
        const nodesToDelete = ['pc-desktop:7301'];
        ClusterStubs.stubClusterConfigByList(clusterLocations);
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');

        // When I click on update cluster
        ClusterPageSteps.updateCluster();
        ClusterListSteps.getClusterUpdateModal().should('be.visible');

        // When I delete the second node
        ClusterListSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7201');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7201\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be removed from the list
        ClusterListSteps.getNodeByEndpoint('http://pc-desktop:7201').should('not.exist');

        // And the delete button should be disabled if minimum nodes required
        ClusterListSteps.isDeleteNodeButtonEnabledByEndpoint('http://pc-desktop:7202')
            .should('be.false');

        //And when I confirm changes
        ClusterStubs.stubDeleteNodesByList(nodesToDelete);
        ClusterListSteps.clickOkButton();
        cy.wait('@response-delete-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "nodes": nodesToDelete
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Nodes removed successfully');
    });

    it('Should be able to add 1 and delete 2 nodes', () => {
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
        RemoteLocationStubs.stubGetRemoteLocationsByList(['http://pc-desktop:7203']);
        RemoteLocationStubs.stubRemoteLocationCheckByAddress([{uri: 'pc-desktop:7203', rpc: 'pc-desktop:7303'}]);

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');

        // When I click on update cluster
        ClusterPageSteps.updateCluster();
        ClusterListSteps.getClusterUpdateModal().should('be.visible');

        // When I delete the second node
        ClusterListSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7201');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7201\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be removed from the list
        ClusterListSteps.getNodeByEndpoint('http://pc-desktop:7201').should('not.exist');

        // When I add node
        ClusterListSteps.clickAddNodeButton();

        // Then I should see the edit node row
        ClusterListSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint
        ClusterListSteps.enterNodeEndpoint('http://pc-desktop:7203');

        // And I save the node
        RemoteLocationStubs.stubAddRemoteLocation();
        ClusterListSteps.clickSaveNodeButton();

        // When I delete the second node
        ClusterListSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7202');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7202\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be removed from the list
        ClusterListSteps.getNodeByEndpoint('http://pc-desktop:7202').should('not.exist');

        // Then I should see the new node in the list
        ClusterListSteps.getNodeByEndpoint('http://pc-desktop:7203').should('exist');

        //And when I confirm changes
        ClusterStubs.stubAddNodesByList(['pc-desktop:7203']);
        ClusterStubs.stubDeleteNodesByList(['pc-desktop:7201', 'pc-desktop:7202']);
        ClusterStubs.stubReplaceNodesByList(['pc-desktop:7203'], ['pc-desktop:7201']);

        ClusterListSteps.clickOkButton();
        cy.wait('@response-replace-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "addNodes": [
                    "pc-desktop:7303"
                ],
                "removeNodes": [
                    "pc-desktop:7301"
                ]
            });
        });

        cy.wait('@response-delete-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "nodes": [
                    "pc-desktop:7302"
                ]
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Nodes replaced successfully');
        ApplicationSteps.getSuccessNotifications().contains('Nodes removed successfully');
    });

    it('Should only replace in cluster when I delete 1, add 1 and replace 1 node', () => {
        const clusterLocations = ['http://pc-desktop:7200', 'http://pc-desktop:7201', 'http://pc-desktop:7202'];
        ClusterStubs.stubClusterConfigByList(clusterLocations);
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubGetRemoteLocations(4);
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
        RemoteLocationStubs.stubRemoteLocationCheckByAddress([
            {uri:'pc-desktop:7203', rpc:'pc-desktop:7303'},
            {uri:'pc-desktop:7202', rpc:'pc-desktop:7302'},
            {uri:'pc-desktop:7233', rpc:'pc-desktop:7333'}
        ]);

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');

        // When I click on update cluster
        ClusterPageSteps.updateCluster();
        ClusterListSteps.getClusterUpdateModal().should('be.visible');

        // Then I should see the 3 nodes in the cluster
        const nodes = ['http://pc-desktop:7200', 'http://pc-desktop:7201', 'http://pc-desktop:7202'];
        nodes.forEach((node) => {
            ClusterListSteps.getNodeByEndpoint(node).should('exist');
        });

        // When I delete the second node
        ClusterListSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7201');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7201\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be removed from the list
        ClusterListSteps.getNodeByEndpoint('http://pc-desktop:7201').should('not.exist');

        // And the delete button should be disabled if minimum nodes required
        ClusterListSteps.isDeleteNodeButtonEnabledByEndpoint('http://pc-desktop:7202')
            .should('be.false');

        // When I add a new node
        ClusterListSteps.clickAddNodeButton();

        // Then I should see the edit node row
        ClusterListSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint
        // RemoteLocationStubs.stubRemoteLocationCheckByAddress('pc-desktop:7233');
        const newNodeEndpoint = 'http://pc-desktop:7233';
        ClusterListSteps.enterNodeEndpoint(newNodeEndpoint);

        // And I save the node
        RemoteLocationStubs.stubAddRemoteLocation();
        ClusterListSteps.clickSaveNodeButton();

        // Then I should see the new node in the list
        ClusterListSteps.getNodeByEndpoint(newNodeEndpoint).should('exist');

        // And the edit node row should not be visible
        ClusterListSteps.getEditNodeRow().should('not.exist');

        // When I replace the first node
        ClusterListSteps.clickReplaceNodeButtonByEndpoint('http://pc-desktop:7200');

        // I expect to see replacing confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to change the location?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then I should see the edit node row
        ClusterListSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint for replacement
        const replacementNodeEndpoint = 'http://pc-desktop:7203';
        ClusterListSteps.enterNodeEndpoint(replacementNodeEndpoint);

        // And I save the replacement
        ClusterListSteps.clickSaveNodeButton();

        // Then I should see the replacement node in the list
        ClusterListSteps.getNodeByEndpoint(replacementNodeEndpoint).should('exist');

        // And the old node should no longer be in the list
        ClusterListSteps.getNodeByEndpoint('http://pc-desktop:7200').should('not.exist');

        //And when I confirm changes
        const nodesToAdd = ['pc-desktop:7233', 'pc-desktop:7203'];
        const nodesToRemove = ['pc-desktop:7301', 'pc-desktop:7300'];
        ClusterStubs.stubReplaceNodesByList(nodesToAdd, nodesToRemove);
        ClusterListSteps.clickOkButton();
        cy.wait('@response-replace-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "addNodes": [
                    "pc-desktop:7333",
                    "pc-desktop:7303"
                ],
                "removeNodes": [
                    "pc-desktop:7301",
                    "pc-desktop:7300"
                ]
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Nodes replaced successfully');
    });
});
