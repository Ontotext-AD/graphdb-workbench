import {ClusterPageSteps} from "../../../steps/cluster/cluster-page-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {GlobalOperationsStatusesStub} from "../../../stubs/global-operations-statuses-stub";
import {ClusterStubs} from "../../../stubs/cluster/cluster-stubs";

function verifyInitialStateWithConfiguredCluster() {
    ClusterPageSteps.getNoClusterImage().should('not.exist');
    ClusterPageSteps.getUpdateClusterButton().should('be.visible');
    ClusterPageSteps.getPreviewClusterConfigButton().should('be.visible');
}

describe('Cluster initial state with configured cluster', () => {
    beforeEach(() => {
        ClusterStubs.stubClusterConfig();
        ClusterStubs.stubClusterGroupStatus();
        ClusterStubs.stubClusterNodeStatus();
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Cluster page via URL with a configured cluster
        ClusterPageSteps.visit();
        // Then,
        verifyInitialStateWithConfiguredCluster();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Cluster page via the navigation menu with a configured cluster
        HomeSteps.visit();
        MainMenuSteps.clickOnCluster();
        // Then,
        verifyInitialStateWithConfiguredCluster();
    });
})
