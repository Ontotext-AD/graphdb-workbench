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
    });

    /**
     * TODO: Broken due to migration  (Error: unknown)
     */
    it.skip('Should display cluster configuration', () => {
        // Given there is an existing cluster created
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        // When I click on edit properties
        ClusterPageSteps.previewClusterConfig();
        // Then I should see cluster configuration with 3 tabs
        ClusterConfigurationSteps.getClusterConfig().should('be.visible');
        ClusterConfigurationSteps.getTabs().should('have.length', 3);
        ClusterConfigurationSteps.getActiveTab().should('have.text', 'Properties');
        ClusterConfigurationSteps.getClusterPropertiesTabContent().should('be.visible');
        ClusterConfigurationSteps.selectTab(1);
        ClusterConfigurationSteps.getActiveTab().should('have.text', 'Nodes');
        ClusterConfigurationSteps.getClusterNodesTabContent().should('be.visible');
        ClusterConfigurationSteps.selectTab(2);
        ClusterConfigurationSteps.getActiveTab().should('have.text', 'Multi-region');
        ClusterConfigurationSteps.getMultiRegionTabContent().should('be.visible');
    });
});
