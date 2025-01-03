import {ClusterPageSteps} from "../../../steps/cluster/cluster-page-steps";
import {GlobalOperationsStatusesStub} from "../../../stubs/global-operations-statuses-stub";
import {ClusterStubs} from "../../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../../stubs/cluster/remote-location-stubs";
import {DeleteClusterDialogSteps} from "../../../steps/cluster/delete-cluster-dialog-steps";
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

    it('Should be able to delete cluster', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();

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

    it('Should be able to edit cluster properties', () => {
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        // When I click on edit properties
        ClusterPageSteps.previewClusterConfig();
        ClusterConfigurationSteps.getClusterConfig().should('be.visible');
        // When I press edit properties
        ClusterConfigurationSteps.editProperties();
        // Then I expect a modal to be shown
        ClusterConfigurationSteps.getModal().should('be.visible');
        // I can set values in form fields
        ClusterConfigurationSteps.setFieldValue('electionMinTimeout', '5000');
        ClusterConfigurationSteps.setFieldValue('electionRangeTimeout', '3000');
        // Verify a field validation error appears if left empty
        ClusterConfigurationSteps.getFieldByName('heartbeatInterval').clear();
        ClusterConfigurationSteps.verifyFieldError('heartbeatInterval', 'This field is required');
        // And Save button is disabled
        ClusterConfigurationSteps.getSaveButton().should('be.disabled');
        // Set value for required field to enable Save button
        ClusterConfigurationSteps.setFieldValue('heartbeatInterval', '1500');
        // And Save button is disabled
        ClusterConfigurationSteps.getSaveButton().should('be.enabled');
        ClusterConfigurationSteps.setFieldValue('messageSizeKB', '64');
        ClusterConfigurationSteps.setFieldValue('verificationTimeout', '1200');
        ClusterConfigurationSteps.setFieldValue('transactionLogMaximumSizeGB', '50');
        ClusterConfigurationSteps.setFieldValue('batchUpdateInterval', '2000');

        // Click Save button to submit
        ClusterStubs.stubSaveClusterConfiguration();
        ClusterConfigurationSteps.save();
        const expectedRequestBody = {
            electionMinTimeout: 5000,
            electionRangeTimeout: 3000,
            heartbeatInterval: 1500,
            messageSizeKB: 64,
            verificationTimeout: 1200,
            transactionLogMaximumSizeGB: 50,
            batchUpdateInterval: 2000
        };
        cy.wait('@save-cluster-properties').then((interception) => {
            expect(interception.request.body).to.deep.equal(expectedRequestBody);
        });
        // And the modal is closed
        ClusterConfigurationSteps.getModal().should('not.exist');
    });
});
