import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {ClusterPageSteps} from "../../../steps/cluster/cluster-page-steps";

function verifyInitialStateWithoutConfiguredCluster() {
    ClusterPageSteps.getNoClusterImage().should('be.visible');
    ClusterPageSteps.getLegendButton().should('be.visible');
}

describe('Cluster initial state without configured cluster', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Cluster page via URL without a configured cluster
        ClusterPageSteps.visit();
        // Then,
        verifyInitialStateWithoutConfiguredCluster();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Cluster page via the navigation menu without a configured cluster
        HomeSteps.visit();
        MainMenuSteps.clickOnCluster();
        // Then,
        verifyInitialStateWithoutConfiguredCluster();
    });
})
