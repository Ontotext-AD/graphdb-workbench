import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ClusterPageSteps} from "../../steps/cluster/cluster-page-steps";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../stubs/cluster/remote-location-stubs";
import {ClusterNodesConfigurationSteps} from "../../steps/cluster/custer-nodes-configuration-steps";
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
        const nodesToAdd = ['http://pc-desktop:7203'];
        const urisToAdd = ['http://pc-desktop:7203'];
        ClusterStubs.stubClusterConfigByList(clusterLocations);
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');

        // When I click on update cluster
        ClusterPageSteps.updateCluster();
        ClusterNodesConfigurationSteps.getClusterNodesConfigurationModal().should('be.visible');

        // Then I should see the 3 nodes in the cluster
        clusterLocations.forEach((node) => {
            ClusterNodesConfigurationSteps.getNodeByEndpoint(node).should('exist');
        });

        // When I add node
        ClusterNodesConfigurationSteps.clickAddNodeButton();

        // Then I should see the edit node row
        ClusterNodesConfigurationSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint
        ClusterNodesConfigurationSteps.enterNodeEndpoint(urisToAdd[0]);

        // And I save the node
        RemoteLocationStubs.stubAddRemoteLocation();
        RemoteLocationStubs.stubGetRemoteLocationsByList(urisToAdd);
        ClusterNodesConfigurationSteps.clickSaveNodeButton();

        // Then I should see the new node in the list
        ClusterNodesConfigurationSteps.getNodeByEndpoint(urisToAdd[0]).should('exist');

        //And when I confirm changes
        ClusterStubs.stubAddNodesByList(nodesToAdd);
        ClusterStubs.stubClusterGroupStatusAfterAdd();
        ClusterNodesConfigurationSteps.clickOkButton();
        cy.wait('@response-add-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "addNodes": nodesToAdd,
                "removeNodes": []
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Cluster updated successfully');
    });

    it('Should be able to delete', () => {
        const clusterLocations = ['http://pc-desktop:7200', 'http://pc-desktop:7201', 'http://pc-desktop:7202'];
        const nodesToDelete = ['http://pc-desktop:7201'];
        ClusterStubs.stubClusterConfigByList(clusterLocations);
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');

        // When I click on update cluster
        ClusterPageSteps.updateCluster();
        ClusterNodesConfigurationSteps.getClusterNodesConfigurationModal().should('be.visible');

        // I see tree nodes in the list
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7200').should('have.text', '1');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7201').should('have.text', '2');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7202').should('have.text', '3');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7200').should('eq', '');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7201').should('eq', '');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7202').should('eq', '');

        // When I delete the second node
        ClusterNodesConfigurationSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7201');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7201\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be decorated with deleting class
        ClusterNodesConfigurationSteps.getNodeLocationByEndpoint('http://pc-desktop:7201').should('have.class', 'deleting');

        // And the node has no index number
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7200').should('have.text', '1');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7201').should('have.text', '');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7202').should('have.text', '2');

        // And deleted node should have new status
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7200').should('eq', '');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7201').should('eq', 'Node will be removed');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7202').should('eq', '');

        // And the delete button should be disabled if minimum nodes required
        ClusterNodesConfigurationSteps.isDeleteNodeButtonEnabledByEndpoint('http://pc-desktop:7202')
            .should('be.false');

        //And when I confirm changes
        ClusterStubs.stubDeleteNodesByList(nodesToDelete);
        ClusterStubs.stubClusterGroupStatusAfterDelete();
        ClusterNodesConfigurationSteps.clickOkButton();
        cy.wait('@response-delete-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "addNodes": [],
                "removeNodes": nodesToDelete
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Cluster updated successfully');
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
        ClusterNodesConfigurationSteps.getClusterNodesConfigurationModal().should('be.visible');

        // When I delete the second node
        ClusterNodesConfigurationSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7201');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7201\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be decorated with deleting class
        ClusterNodesConfigurationSteps.getNodeLocationByEndpoint('http://pc-desktop:7201').should('have.class', 'deleting');

        // When I add node
        ClusterNodesConfigurationSteps.clickAddNodeButton();

        // Then I should see the edit node row
        ClusterNodesConfigurationSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint
        ClusterNodesConfigurationSteps.enterNodeEndpoint('http://pc-desktop:7203');

        // And I save the node
        RemoteLocationStubs.stubAddRemoteLocation();
        ClusterNodesConfigurationSteps.clickSaveNodeButton();

        // When I delete the second node
        ClusterNodesConfigurationSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7202');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7202\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be decorated with deleting class
        ClusterNodesConfigurationSteps.getNodeLocationByEndpoint('http://pc-desktop:7202').should('have.class', 'deleting');

        // Then I should see the new node in the list
        ClusterNodesConfigurationSteps.getNodeByEndpoint('http://pc-desktop:7203').should('exist');

        // And all changed nodes should have new status and index numbers
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7200').should('eq', '');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7201').should('eq', 'Node will be removed');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7202').should('eq', 'Node will be removed');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7203').should('eq', 'Node will be added');
        // And the node has no index number
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7200').should('have.text', '1');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7201').should('have.text', '');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7202').should('have.text', '');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7203').should('have.text', '2');


        //And when I confirm changes
        ClusterStubs.stubAddNodesByList(['http://pc-desktop:7203']);
        ClusterStubs.stubDeleteNodesByList(['http://pc-desktop:7201', 'http://pc-desktop:7202']);
        ClusterStubs.stubReplaceNodesByList(['http://pc-desktop:7203'], ['http://pc-desktop:7201']);
        ClusterStubs.stubClusterGroupStatusAfterReplace();

        ClusterNodesConfigurationSteps.clickOkButton();
        cy.wait('@response-replace-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "addNodes": [
                    "http://pc-desktop:7203"
                ],
                "removeNodes": [
                    "http://pc-desktop:7201",
                    "http://pc-desktop:7202"
                ]
            });
        });

        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Cluster updated successfully');
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
            {uri: 'pc-desktop:7203', rpc: 'pc-desktop:7303'},
            {uri: 'pc-desktop:7202', rpc: 'pc-desktop:7302'},
            {uri: 'pc-desktop:7233', rpc: 'pc-desktop:7333'}
        ]);

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');

        // When I click on update cluster
        ClusterPageSteps.updateCluster();
        ClusterNodesConfigurationSteps.getClusterNodesConfigurationModal().should('be.visible');

        // Then I should see the 3 nodes in the cluster
        const nodes = ['http://pc-desktop:7200', 'http://pc-desktop:7201', 'http://pc-desktop:7202'];
        nodes.forEach((node) => {
            ClusterNodesConfigurationSteps.getNodeByEndpoint(node).should('exist');
        });

        // When I delete the second node
        ClusterNodesConfigurationSteps.clickDeleteNodeButtonByEndpoint('http://pc-desktop:7201');

        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to detach the location \'http://pc-desktop:7201\'?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then the node should be decorated with deleting class
        ClusterNodesConfigurationSteps.getNodeLocationByEndpoint('http://pc-desktop:7201').should('have.class', 'deleting');

        // And deleted node should have new status
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7201').should('eq', 'Node will be removed');

        // And the delete button should be disabled if minimum nodes required
        ClusterNodesConfigurationSteps.isDeleteNodeButtonEnabledByEndpoint('http://pc-desktop:7202').should('be.false');

        // When I add a new node
        ClusterNodesConfigurationSteps.clickAddNodeButton();

        // Then I should see the edit node row
        ClusterNodesConfigurationSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint
        const newNodeEndpoint = 'http://pc-desktop:7233';
        ClusterNodesConfigurationSteps.enterNodeEndpoint(newNodeEndpoint);

        // And I save the node
        RemoteLocationStubs.stubAddRemoteLocation();
        ClusterNodesConfigurationSteps.clickSaveNodeButton();

        // Then I should see the new node in the list
        ClusterNodesConfigurationSteps.getNodeByEndpoint(newNodeEndpoint).should('exist');

        // With new status
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint(newNodeEndpoint).should('eq', 'Node will be added');

        // And the edit node row should not be visible
        ClusterNodesConfigurationSteps.getEditNodeRow().should('not.exist');

        // When I replace the first node
        ClusterNodesConfigurationSteps.clickReplaceNodeButtonByEndpoint('http://pc-desktop:7200');

        // I expect to see replacing confirmation dialog.
        ModalDialogSteps.getDialogBody().should('contain', 'Are you sure you want to change the location?');

        // When I confirm
        ModalDialogSteps.getConfirmButton().click();

        // Then I should see the edit node row
        ClusterNodesConfigurationSteps.getEditNodeRow().should('be.visible');

        // When I enter a new endpoint for replacement
        const replacementNodeEndpoint = 'http://pc-desktop:7203';
        ClusterNodesConfigurationSteps.enterNodeEndpoint(replacementNodeEndpoint);

        // And I save the replacement
        ClusterNodesConfigurationSteps.clickSaveNodeButton();

        // Then I should see the replacement node in the list
        ClusterNodesConfigurationSteps.getNodeByEndpoint(replacementNodeEndpoint).should('exist');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint(replacementNodeEndpoint).should('eq', 'Node will be added');

        // And the old node should have new class and status
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7200').should('eq', 'Node will be removed');

        // And all changed nodes should have new status and index numbers
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7200').should('eq', 'Node will be removed');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7201').should('eq', 'Node will be removed');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7202').should('eq', '');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7233').should('eq', 'Node will be added');
        ClusterNodesConfigurationSteps.getNodeStatusByEndpoint('http://pc-desktop:7203').should('eq', 'Node will be added');
        // And the node has no index number
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7200').should('have.text', '');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7201').should('have.text', '');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7202').should('have.text', '1');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7233').should('have.text', '2');
        ClusterNodesConfigurationSteps.getNodeIndexByEndpoint('http://pc-desktop:7203').should('have.text', '3');

        //And when I confirm changes
        const nodesToAdd = ['http://pc-desktop:7233', 'http://pc-desktop:7203'];
        const nodesToRemove = ['http://pc-desktop:7201', 'http://pc-desktop:7200'];
        ClusterStubs.stubReplaceNodesByList(nodesToAdd, nodesToRemove);
        ClusterStubs.stubClusterGroupStatusAfterReplaceAndDelete();
        ClusterNodesConfigurationSteps.clickOkButton();
        cy.wait('@response-replace-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "addNodes": [
                    "http://pc-desktop:7233",
                    "http://pc-desktop:7203"
                ],
                "removeNodes": [
                    "http://pc-desktop:7201",
                    "http://pc-desktop:7200"
                ]
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Cluster updated successfully');
    });

    it('Should be able to open a create cluster dialog', () => {
        ClusterStubs.stubNoClusterNodeStatus();
        ClusterStubs.stubNoClusterGroupStatus();
        ClusterStubs.stubNoClusterConfig();
        RemoteLocationStubs.stubAddRemoteLocation();
        RemoteLocationStubs.stubGetRemoteLocations(0);

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        // Then I expect that the page should be loaded
        ClusterPageSteps.getClusterPage().should('be.visible');
        // And the create cluster button to be visible
        ClusterPageSteps.getCreateClusterButton().should('be.visible').and('have.class', 'no-cluster');
        // When I click on the create cluster button
        ClusterPageSteps.createCluster();

        // Then I should see create cluster modal
        ClusterNodesConfigurationSteps.getClusterNodesConfigurationModal().should('be.visible');
        // I should see the local node
        ClusterNodesConfigurationSteps.getNodeByEndpoint('http://pc-desktop:7200').should('exist');
        // I should see buttons, warnings and advanced options
        ClusterNodesConfigurationSteps.getAddNodeButton().should('be.visible').and('be.enabled');
        ClusterNodesConfigurationSteps.getOkButton().should('be.visible').and('be.disabled');
        ClusterNodesConfigurationSteps.getAdvancedOptions().should('be.visible').and('be.enabled');
        ClusterNodesConfigurationSteps.getSaveAlert().should('be.visible');


        const urisToAdd = ['http://pc-desktop:7203'];
        RemoteLocationStubs.stubGetRemoteLocationsByList(urisToAdd);
        RemoteLocationStubs.stubRemoteLocationCheckByAddress([{uri: 'pc-desktop:7203', rpc: 'pc-desktop:7303'}]);

        // When I add node
        ClusterNodesConfigurationSteps.clickAddNodeButton();
        // Then I should see the edit node row
        ClusterNodesConfigurationSteps.getEditNodeRow().should('be.visible');
        // When I enter a new endpoint
        ClusterNodesConfigurationSteps.enterNodeEndpoint('http://pc-desktop:7203');
        // And I save the node
        RemoteLocationStubs.stubAddRemoteLocation();
        ClusterNodesConfigurationSteps.clickSaveNodeButton();
        // Then I should see the new node in the list
        ClusterNodesConfigurationSteps.getNodeByEndpoint('http://pc-desktop:7203').should('exist');


        //And when I confirm changes
        ClusterStubs.stubCreateClusterByList(['http://pc-desktop:7200', 'http://pc-desktop:7203']);
        ClusterNodesConfigurationSteps.clickOkButton();
        cy.wait('@2-nodes-cluster-created').then((interception) => {
            console.log(interception.request.body);
            expect(interception.request.body).to.deep.equal({
                "electionMinTimeout": 8000,
                "electionRangeTimeout": 6000,
                "heartbeatInterval": 2000,
                "messageSizeKB": 64,
                "verificationTimeout": 1500,
                "transactionLogMaximumSizeGB": 50.0,
                "nodes": ['http://pc-desktop:7200', 'http://pc-desktop:7203']
            });
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains('Cluster created successfully');
    });
});
