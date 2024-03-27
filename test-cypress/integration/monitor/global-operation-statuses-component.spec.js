import HomeSteps from "../../steps/home-steps";
import {OperationsStatusesComponentSteps} from "../../steps/operations-statuses-component-steps";
import ImportSteps from "../../steps/import/import-steps";
import {GlobalOperationsStatusesStub} from "../../stubs/global-operations-statuses-stub";

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
        ImportSteps.visitUserImport(repositoryId);
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

    it('should redirect to query and update view wen click on queries operation element', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // When I click on "Running query" operation element.
        // Then I expect to be redirected to "Query and Update monitoring" view.
        OperationsStatusesComponentSteps.checkOperationElementUrl('monitor/queries', 3);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');
    });

    it('should redirect to query and update view wen click on updates operation element', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // When I click on "Running updates" operation element.
        // Then I expect to be redirected to "Query and Update monitoring" view.
        OperationsStatusesComponentSteps.checkOperationElementUrl('monitor/queries', 4);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');
    });

    it('should redirect to query and update view wen click on imports operation element', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // When I click on "Running imports" operation element.
        // Then I expect to be redirected to "Query and Update monitoring" view.
        OperationsStatusesComponentSteps.checkOperationElementUrl('import', 2);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');
    });

    it('should redirect to query and update view wen click on backup and restore operation element', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // When I click on "Creating backup" operation element.
        // Then I expect to be redirected to "Backup and Restore" view.
        OperationsStatusesComponentSteps.checkOperationElementUrl('monitor/backup-and-restore', 1);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

    });

    it('should redirect to query and update view wen click on cluster operation element', () => {
        // When I visit some page and there are running operations.
        GlobalOperationsStatusesStub.stubGlobalOperationsStatusesResponse(repositoryId);
        HomeSteps.visitAndWaitLoader();
        // Then I expect "Global Operations Component" to be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

        OperationsStatusesComponentSteps.openOperationStatusesDialog();
        // When I click on "Unavailable nodes" operation element.
        // Then I expect to be redirected to "Cluster Monitoring" view.
        OperationsStatusesComponentSteps.checkOperationElementUrl('cluster', 0);
        // Then I expect "Global Operations Component" to still be displayed.
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().should('exist');

    });
});
