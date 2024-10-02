import {ClusterPageSteps} from "../../steps/cluster/cluster-page-steps";
import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../stubs/cluster/remote-location-stubs";
import {DeleteClusterDialogSteps} from "../../steps/cluster/delete-cluster-dialog-steps";
import {ClusterConfigurationSteps} from "../../steps/cluster/cluster-configuration-steps";

describe('Cluster management', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'cluster-repo' + Date.now();
        GlobalOperationsStatusesStub.stubNoOperationsResponse(repositoryId);
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
        ClusterPageSteps.previewClusterConfig();
        ClusterConfigurationSteps.getClusterConfig().should('be.visible');
        ClusterConfigurationSteps.deleteCluster();
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
        ClusterPageSteps.getRemoveNodesButton().should('not.exist');
        ClusterPageSteps.getAddNodesButton().should('not.exist');
        ClusterPageSteps.getReplaceNodesButton().should('not.exist');
        ClusterPageSteps.getPreviewClusterConfigButton().should('not.exist');
        ClusterPageSteps.getCreateClusterButton().should('have.class', 'no-cluster');
    });
});
