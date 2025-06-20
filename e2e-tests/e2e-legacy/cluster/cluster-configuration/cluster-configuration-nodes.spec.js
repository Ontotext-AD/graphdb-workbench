import {ClusterPageSteps} from "../../../steps/cluster/cluster-page-steps";
import {GlobalOperationsStatusesStub} from "../../../stubs/global-operations-statuses-stub";
import {ClusterStubs} from "../../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../../stubs/cluster/remote-location-stubs";
import {ClusterConfigurationSteps} from "../../../steps/cluster/cluster-configuration-steps";

describe('Cluster configuration', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'cluster-repo' + Date.now();
        GlobalOperationsStatusesStub.stubNoOperationsResponse(repositoryId);
        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
    });

    it('should display the nodes list with correct node information in the modal', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        // When I click on edit properties and open Nodes tab
        ClusterPageSteps.previewClusterConfig();
        ClusterConfigurationSteps.selectNodesTab();
        // I expect to see
        ClusterConfigurationSteps.getNodesListHeader().should('contain.text', 'Nodes list');
        ClusterConfigurationSteps.assertNodesCount(3);

        const nodeData = [
            {
                url: 'http://pc-desktop:7200',
                rpcAddress: 'pc-desktop:7300',
                state: 'FOLLOWER',
                local: true
            },
            {
                url: 'http://pc-desktop:7201',
                rpcAddress: 'pc-desktop:7301',
                state: 'LEADER',
                local: false
            },
            {
                url: 'http://pc-desktop:7202',
                rpcAddress: 'pc-desktop:7302',
                state: 'FOLLOWER',
                local: false
            }
        ];

        nodeData.forEach((data, index) => {
            ClusterConfigurationSteps.getNodeLink(index)
                .should('have.attr', 'href', data.url)
                .and('contain.text', data.url);

            ClusterConfigurationSteps.getNodeRPCAddress(index)
                .should('contain.text', data.rpcAddress);

            ClusterConfigurationSteps.getNodeState(index)
                .should('contain.text', data.state);

            if (data.local) {
                ClusterConfigurationSteps.isNodeLocal(index).should('exist');
            } else {
                ClusterConfigurationSteps.isNodeLocal(index).should('not.exist');
            }
        });
    });
});
