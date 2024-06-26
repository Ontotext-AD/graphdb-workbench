import {ClusterPageSteps} from "../../../steps/cluster/cluster-page-steps";
import {GlobalOperationsStatusesStub} from "../../../stubs/global-operations-statuses-stub";
import {ClusterStubs} from "../../../stubs/cluster/cluster-stubs";
import {RemoteLocationStubs} from "../../../stubs/cluster/remote-location-stubs";
import {ClusterConfigurationSteps} from "../../../steps/cluster/cluster-configuration-steps";
import {ModalDialogSteps} from "../../../steps/modal-dialog-steps";
import {ApplicationSteps} from "../../../steps/application-steps";

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

    it('should be able to add and delete tags', () => {
        const tagName = 'test';
        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        // When I click on edit properties and open Multi-region tab
        ClusterPageSteps.previewClusterConfig();
        ClusterConfigurationSteps.selectMultiRegionConfigTab();
        // I expect to see
        ClusterConfigurationSteps.getMultiRegionHeader().should('contain.text', 'Primary cluster');
        ClusterConfigurationSteps.getAddTagButton().should('be.visible').and('not.be.disabled');
        ClusterConfigurationSteps.getEnableSecondaryModeButton().should('be.visible').and('be.enabled');
        ClusterConfigurationSteps.getTagsTable().should('not.exist');

        ClusterStubs.stubAddTag(tagName);
        ClusterConfigurationSteps.clickAddTagButton();
        ClusterConfigurationSteps.typeTag(tagName);
        ClusterConfigurationSteps.clickSubmitTagButton();
        cy.wait('@add-tag').then((interception) => {
            expect(interception.request.body).to.deep.equal({tag: tagName});
        });

        ClusterStubs.stubClusterGroupStatusWithTag();
        cy.wait('@3-nodes-cluster-group-status-tag');
        // Assert the tags table contains the expected tag
        ClusterConfigurationSteps.getTagsTable().should('be.visible');
        ClusterConfigurationSteps.getTagsTableRows().should('contain.text', tagName);

        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains(`Successfully added to cluster primary identifier tag: ${tagName}`);

        //When I delete the tag
        ClusterConfigurationSteps.clickDeleteTagButton();
        // I expect to see deleting confirmation dialog.
        ModalDialogSteps.getDialogHeader().should('contain', `Delete identifier tag ${tagName}`);
        ModalDialogSteps.getDialogBody().should('contain', 'Deleting identifier tag would stop any secondary cluster identified with it from pulling updates.');

        // When I confirm
        ClusterStubs.stubDeleteTag(tagName);
        ModalDialogSteps.clickOnConfirmButton();
        cy.wait('@delete-tag').then((interception) => {
            expect(interception.request.body).to.deep.equal({tag: tagName});
        });
    });

    it('should be able to switch modes', () => {
        ClusterStubs.stubEnableSecondaryMode();
        const rpcAddress = 'node-name:7300';
        const tag = 'us-central';

        // Given I have opened the cluster management page
        ClusterPageSteps.visit();
        // When I click on edit properties and open Nodes tab
        ClusterPageSteps.previewClusterConfig();
        ClusterConfigurationSteps.selectMultiRegionConfigTab();
        // I click enable secondary mode btn
        ClusterConfigurationSteps.clickEnableSecondaryModeButton();
        // I expect to see enable secondary mode confirmation dialog.
        ModalDialogSteps.getDialogHeader().should('contain', `Enable secondary mode`);
        ModalDialogSteps.getDialogBody().should('contain', 'By enabling secondary mode this cluster would become a read-only replica of the specified primary cluster.');
        // When I confirm I expect to see configuration modal
        ModalDialogSteps.getConfirmButton().click();
        ModalDialogSteps.getDialogHeader().should('contain', `Secondary cluster settings`);
        ClusterConfigurationSteps.getEnableButton().should('be.disabled');
        ClusterConfigurationSteps.typeRpcAddress(rpcAddress);
        ClusterConfigurationSteps.getEnableButton().should('be.disabled');
        ClusterConfigurationSteps.typePrimaryTag(tag);
        ClusterConfigurationSteps.getEnableButton().should('not.be.disabled');
        ClusterConfigurationSteps.clickEnableButton();
        cy.wait('@enable-secondary-mode').then((interception) => {
            expect(interception.request.body).to.deep.equal({primaryNode: rpcAddress, tag});
        });
        // And expect success message to be displayed.
        ApplicationSteps.getSuccessNotifications().contains(`Successfully enabled secondary mode`);
    });
});
