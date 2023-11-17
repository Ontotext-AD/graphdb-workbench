import {ClusterPageSteps} from "../../steps/cluster/cluster-page-steps";
import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ClusterStubs} from "../../stubs/cluster/cluster-stubs";
import {CreateClusterDialogSteps} from "../../steps/cluster/create-cluster-dialog-steps";
import {AddRemoteLocationDialogSteps} from "../../steps/cluster/add-remote-location-dialog-steps";
import {RemoteLocationStubs} from "../../stubs/cluster/remote-location-stubs";
import {DeleteClusterDialogSteps} from "../../steps/cluster/delete-cluster-dialog-steps";

describe('Cluster management', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'cluster-repo' + Date.now();
        GlobalOperationsStatusesStub.stubNoOperationsResponse(repositoryId);
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
    });

    it('Should be able to open a create cluster dialog', () => {
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
});

function addRemoteLocation(location, locationsCount) {
    CreateClusterDialogSteps.openAddRemoteLocationDialog();
    AddRemoteLocationDialogSteps.getDialog().should('be.visible');
    AddRemoteLocationDialogSteps.typeLocation(location);
    RemoteLocationStubs.stubGetRemoteLocations(locationsCount);
    AddRemoteLocationDialogSteps.addLocation();
}
