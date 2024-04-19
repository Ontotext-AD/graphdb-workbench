import {ClusterPageSteps} from "../../steps/cluster/cluster-page-steps";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../stubs/cluster/remote-location-stubs";
import {ClusterViewSteps} from "../../steps/cluster/cluster-view-steps";
import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";

describe('Cluster states', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'cluster-repo' + Date.now();
        GlobalOperationsStatusesStub.stubNoOperationsResponse(repositoryId);
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
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Waiting for snapshot from node http://pc...');
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
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Building a snapshot for http://pc-deskto...');
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
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Sending a snapshot to node http://pc-des...');
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
        ClusterViewSteps.getNodeInfoText('pc-desktop:7201').should('have.text', 'Receiving a snapshot from node http://pc...');
        // The third, without message,
        ClusterViewSteps.getNodeInfoText('pc-desktop:7202').should('have.text', '');
    });
});
