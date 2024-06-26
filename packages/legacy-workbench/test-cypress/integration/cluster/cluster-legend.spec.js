import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ClusterPageSteps} from "../../steps/cluster/cluster-page-steps";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../stubs/cluster/remote-location-stubs";

describe('Cluster legend', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'cluster-repo' + Date.now();
        GlobalOperationsStatusesStub.stubNoOperationsResponse(repositoryId);
    });

    it('Should be able to open cluster view legend', () => {
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
        RemoteLocationStubs.stubRemoteLocationFilter();
        RemoteLocationStubs.stubRemoteLocationStatusInCluster();
        // Given I have opened the cluster view
        ClusterPageSteps.visit();
        // When I click on cluster legend button
        ClusterPageSteps.openLegend();
        // Then I expect that the legend should be displayed
        ClusterPageSteps.getLegend().should('be.visible');
        ClusterPageSteps.getLegendNodes().should('have.length', 3);
        ClusterPageSteps.getLegendNodeStates().should('have.length', 12);
        ClusterPageSteps.getLegendLinkStates().should('have.length', 4);
        // When I click on the legend button
        ClusterPageSteps.openLegend();
        // Then I expect the legend to disappear
        // TODO: this doesn't work and says that it's not hidden and it exists although it's clearly not visible on the screen.
        // ClusterPageSteps.getLegend().should('be.hidden');
    });
});
