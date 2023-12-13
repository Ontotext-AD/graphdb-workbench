import {ClusterPageSteps} from "../../steps/cluster/cluster-page-steps";
import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {CreateClusterDialogSteps} from "../../steps/cluster/create-cluster-dialog-steps";
import {AddRemoteLocationDialogSteps} from "../../steps/cluster/add-remote-location-dialog-steps";
import {RemoteLocationStubs} from "../../stubs/cluster/remote-location-stubs";
import {DeleteClusterDialogSteps} from "../../steps/cluster/delete-cluster-dialog-steps";
import {ReplaceNodesDialogSteps} from "../../steps/cluster/replace-nodes-dialog-steps";
import {ApplicationSteps} from "../../steps/application-steps";
import {ClusterViewSteps} from "../../steps/cluster/cluster-view-steps";

describe('Cluster management', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'cluster-repo' + Date.now();
        GlobalOperationsStatusesStub.stubNoOperationsResponse(repositoryId);
    });

    it('Should be able to open a create cluster dialog', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        ClusterStubs.stubNoClusterGroupStatus();
        ClusterStubs.stubNoClusterNodeStatus();
        ClusterStubs.stubNoClusterConfig();
        RemoteLocationStubs.stubAddRemoteLocation();
        RemoteLocationStubs.stubGetRemoteLocations(0);

        // Then I expect that the page should be loaded
        ClusterPageSteps.getClusterPage().should('be.visible');
        // And the create cluster button to be visible
        ClusterPageSteps.getCreateClusterButton().should('be.visible').and('have.class', 'no-cluster');
        // When I click on the create cluster button
        ClusterPageSteps.createCluster();
        // Then I expect create cluster dialog to become visible
        CreateClusterDialogSteps.getDialog().should('be.visible');
        CreateClusterDialogSteps.getDialogHeader().should('contain.text', 'Create cluster');
        // And I expect to see a single node in the cluster nodes list
        CreateClusterDialogSteps.getClusterNodesList().should('have.length', 1);
        // And I expect to see no remote locations in the locations list
        CreateClusterDialogSteps.getRemoteLocationsList().should('have.length', 0);
        // And I expect that the create cluster button should be disabled
        CreateClusterDialogSteps.getNoSelectedNodesWarning().should('be.visible');
        // And I expect that the create cluster button should be disabled
        CreateClusterDialogSteps.getSaveClusterConfigButton().should('be.disabled');
        // When I click on the cancel button
        CreateClusterDialogSteps.clickOnCancelButton();
        // Then I expect that the create cluster dialog should be closed
        CreateClusterDialogSteps.getDialog().should('not.exist');
    });

    it('Should be able to create a cluster', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        // When there is no cluster configured yet
        ClusterStubs.stubNoClusterGroupStatus();
        ClusterStubs.stubNoClusterNodeStatus();
        ClusterStubs.stubNoClusterConfig();
        RemoteLocationStubs.stubAddRemoteLocation();
        RemoteLocationStubs.stubGetRemoteLocations(0);

        // When I open the create cluster dialog
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.createCluster();
        CreateClusterDialogSteps.getDialog().should('be.visible');
        // And I add a remote location
        RemoteLocationStubs.stubRemoteLocationCheck();
        addRemoteLocation('http://localhost:7201', 1);
        CreateClusterDialogSteps.getRemoteLocationsList().should('have.length', 1);
        // When I select the added remote location
        CreateClusterDialogSteps.selectRemoteLocation(0);
        // Then I expect that the remote location will be added to the cluster nodes list
        CreateClusterDialogSteps.getRemoteLocationsList().should('have.length', 0);
        CreateClusterDialogSteps.getClusterNodesList().should('have.length', 2);
        // And the no selected nodes warning should disappear
        CreateClusterDialogSteps.getNoSelectedNodesWarning().should('not.exist');
        // When I add another remote location
        addRemoteLocation('http://localhost:7202', 2);
        // Then I expect it to be added to the cluster nodes list
        CreateClusterDialogSteps.getRemoteLocationsList().should('have.length', 1);
        CreateClusterDialogSteps.selectRemoteLocation(0);
        CreateClusterDialogSteps.getRemoteLocationsList().should('have.length', 0);
        CreateClusterDialogSteps.getClusterNodesList().should('have.length', 3);
        // When I click on create cluster button
        ClusterStubs.stubCreateCluster();
        CreateClusterDialogSteps.saveClusterConfig();
        // Then I expect that the create cluster dialog should be closed
        CreateClusterDialogSteps.getDialog().should('not.exist');
        // And cluster should be created
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
        // And cluster management actions should be accessible
        ClusterPageSteps.getClusterDeleteButton().should('be.visible');
        ClusterPageSteps.getRemoveNodesButton().should('be.visible');
        ClusterPageSteps.getAddNodesButton().should('be.visible');
        ClusterPageSteps.getReplaceNodesButton().should('be.visible');
        ClusterPageSteps.getPreviewClusterConfigButton().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');
    });

    it('Should be able to delete cluster', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');
        // When I click on delete cluster
        ClusterPageSteps.deleteCluster();
        // Then I expect a confirmation dialog to appear
        DeleteClusterDialogSteps.getDialog().should('be.visible');
        // When I confirm
        ClusterStubs.stubDeleteCluster();
        ClusterStubs.stubNoClusterGroupStatus();
        ClusterStubs.stubNoClusterNodeStatus();
        DeleteClusterDialogSteps.confirmDeleteCluster();
        // Then Cluster should be deleted
        ClusterStubs.stubNoClusterConfig();
        RemoteLocationStubs.stubRemoteLocationStatusNotCluster();
        DeleteClusterDialogSteps.getDialog().should('not.exist');
        ClusterPageSteps.getClusterDeleteButton().should('not.exist');
        ClusterPageSteps.getRemoveNodesButton().should('not.exist');
        ClusterPageSteps.getAddNodesButton().should('not.exist');
        ClusterPageSteps.getReplaceNodesButton().should('not.exist');
        ClusterPageSteps.getPreviewClusterConfigButton().should('not.exist');
        ClusterPageSteps.getCreateClusterButton().should('have.class', 'no-cluster');
    });

    it('Should be display correct message for "waiting-for-snapshot" recovery state', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        // and two nodes have a "waiting-for-snapshot" recovery status. One of them is without an affected node.
        ClusterStubs.stubClusterWithRecoveryStatusGroupStatus('waiting-for-snapshot');
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();

        // Then I expect to see cluster view with 3 nodes,
        ClusterViewSteps.getNodes().should('have.length', 3);
        // The first, with corresponding for "waiting-for-snapshot" status message without affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7200').should('have.text', 'Waiting for snapshot');
        // The second, with corresponding for "waiting-for-snapshot" status message followed with affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Waiting for snapshot from node http://pc-desktop:7200');
        // The third, without message,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7202').should('have.text', '');
    });

    it('Should be display correct message for "building-snapshot" recovery state', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        // and two nodes have a "building-snapshot" recovery status. One of them is without an affected node.
        ClusterStubs.stubClusterWithRecoveryStatusGroupStatus('building-snapshot');
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();

        // Then I expect to see cluster view with 3 nodes,
        ClusterViewSteps.getNodes().should('have.length', 3);
        // The first, with corresponding for "building-snapshot" status message without affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7200').should('have.text', 'Building a snapshot');
        // The second, with corresponding for "building-snapshot" status message followed with affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Building a snapshot for http://pc-desktop:7200, http://pc-desktop:7204');
        // The third, without message,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7202').should('have.text', '');
    });

    it('Should be display correct message for "sending-snapshot" recovery state', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        // and two nodes have a "sending-snapshot" recovery status. One of them is without an affected node.
        ClusterStubs.stubClusterWithRecoveryStatusGroupStatus('sending-snapshot');
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();

        // Then I expect to see cluster view with 3 nodes,
        ClusterViewSteps.getNodes().should('have.length', 3);
        // The first, with corresponding for "sending-snapshot" status message without affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7200').should('have.text', 'Sending a snapshot');
        // The second, with corresponding for "sending-snapshot" status message followed with affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Sending a snapshot to node http://pc-desktop:7200');
        // The third, without message,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7202').should('have.text', '');
    });

    it('Should be display correct message for "receiving-snapshot" recovery state', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        // and two nodes have a "receiving-snapshot" recovery status. One of them is without an affected node.
        ClusterStubs.stubClusterWithRecoveryStatusGroupStatus('receiving-snapshot');
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();

        // Then I expect to see cluster view with 3 nodes,
        ClusterViewSteps.getNodes().should('have.length', 3);
        // The first, with corresponding for "receiving-snapshot" status message without affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7200').should('have.text', 'Receiving a snapshot');
        // The second, with corresponding for "receiving-snapshot" status message followed with affected nodes,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Receiving a snapshot from node http://pc-desktop:7200');
        // The third, without message,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7202').should('have.text', '');
    });

    it('Should be able to replace nodes in cluster', () => {
        // Given I have opened the cluster management page
        RemoteLocationStubs.stubGetRemoteLocations();
        ClusterPageSteps.visit();

        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');
        // When I click on replace nodes button
        ClusterPageSteps.replaceNodes();
        // Then I expect a replace nodes dialog to appear
        ReplaceNodesDialogSteps.getDialog().should('be.visible');
        ReplaceNodesDialogSteps.getClusterNodes().should('have.length', 3);
        ReplaceNodesDialogSteps.getRemoteLocations().should('have.length', 0);
        ReplaceNodesDialogSteps.getReplaceNodesButton().should('be.disabled');
        // When I add a new remote location
        RemoteLocationStubs.stubAddRemoteLocation();
        RemoteLocationStubs.stubRemoteLocationCheck();
        addRemoteLocation('http://localhost:7203', 3);
        ClusterPageSteps.getClusterPage().should('be.visible');
        ClusterPageSteps.getCreateClusterButton().should('not.have.class', 'no-cluster');
        // And I select the new location as replacement node
        ReplaceNodesDialogSteps.selectRemoteLocation(0);
        ReplaceNodesDialogSteps.getSelectedRemoteLocations().should('have.length', 1);
        // And I select a node from the cluster to be replaced
        ReplaceNodesDialogSteps.selectClusterNode(2);
        // Then I expect the replace nodes button to become enabled
        ReplaceNodesDialogSteps.getReplaceNodesButton().should('not.be.disabled');
        // When I click on replace nodes button
        ClusterStubs.stubReplaceNodes();
        ReplaceNodesDialogSteps.replaceNodes();
        // Then I expect nodes to be replaced
        cy.wait('@replace-nodes').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                "addNodes": [
                    "pc-desktop:7301\n"
                ],
                "removeNodes": [
                    "pc-desktop:7302"
                ]
            });
        });
        ReplaceNodesDialogSteps.getDialog().should('not.exist');
        ApplicationSteps.getSuccessNotifications().should('be.visible');
    });
});

function addRemoteLocation(location, locationsCount) {
    CreateClusterDialogSteps.openAddRemoteLocationDialog();
    AddRemoteLocationDialogSteps.getDialog().should('be.visible');
    AddRemoteLocationDialogSteps.typeLocation(location);
    RemoteLocationStubs.stubGetRemoteLocations(locationsCount);
    AddRemoteLocationDialogSteps.addLocation();
}
