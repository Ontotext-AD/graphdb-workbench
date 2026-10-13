import HomeSteps from "../../steps/home-steps";
import {OperationsStatusesComponentSteps} from "../../steps/operations-statuses-component-steps";
import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";
import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {BrowserStubs} from "../../stubs/browser-stubs";

describe('Operations Status Component', () => {

    const repositoryId = 'backup-and-restore-' + Date.now();
    beforeEach(() => {
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should not display the operation status component if there are not run operations.', () => {
        // When I visit some page and there are no running operations.
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to not be visible.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('not.exist');

        // When I visit some page and there are not running operations.
        ImportUserDataSteps.visitUserImport(repositoryId);
        // Then I expect "Global Operations Component" to not be visible.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('not.exist');
    });

    it('should display icons with ongoing operations', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.getImportOperationStatusHeaderElement()
            .should('have.length', 1)
            .parent()
            .find('.running-operation-count')
            .should('exist')
            .contains('1');

        OperationsStatusesComponentSteps.getQueriesOperationStatusHeaderElement()
            .should('have.length', 1)
            .parent()
            .find('.running-operation-count')
            .should('exist')
            .contains('26');

        OperationsStatusesComponentSteps.getBackupAndRestoreOperationStatusHeaderElement()
            .should('have.length', 1)
            .parent()
            .find('.running-operation-count')
            .should('not.exist');

        OperationsStatusesComponentSteps.getClusterOperationStatusHeaderElement()
            .should('have.length', 1)
            .parent()
            .find('.running-operation-count')
            .should('not.exist');

    });

    it('should link the queries operation element to its view in a new window', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // Then I expect "Running query" operation element to link to "Query and Update monitoring" view in a new window.
        checkOperationElementUrl('monitor/queries', 3);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');
    });

    it('should link the updates operation element to its view in a new window', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // Then I expect "Running updates" operation element to link to "Query and Update monitoring" view in a new window.
        checkOperationElementUrl('monitor/queries', 4);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');
    });

    it('should link the imports operation element to its view in a new window', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // Then I expect "Running imports" operation element to link to "Import" view in a new window.
        checkOperationElementUrl('import', 2);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');
    });

    it('should link the backup and restore operation element to its view in a new window', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // Then I expect "Creating backup" operation element to link to "Backup and Restore" view in a new window.
        checkOperationElementUrl('monitor/backup-and-restore', 1);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

    });

    it('should link the cluster operation element to its view in a new window', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // Then I expect "Unavailable nodes" operation element to link to "Cluster Monitoring" view in a new window.
        checkOperationElementUrl('cluster', 0);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

    });

    function checkOperationElementUrl(expectedUrl, operationIndex = 0) {
        BrowserStubs.captureLinkClicks();
        OperationsStatusesComponentSteps.getOperationStatuses().eq(operationIndex).click();
        // The page must leave the click to the browser, which opens the link in a new window.
        cy.get(BrowserStubs.LINK_CLICKS_ALIAS()).should('deep.equal', [{href: expectedUrl, target: '_blank', defaultPrevented: false}]);
    }
});
