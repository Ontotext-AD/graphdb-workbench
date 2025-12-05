import {BrowserStubs} from "../stubs/browser-stubs";

export class OperationsStatusesComponentSteps {

    static getOperationsStatusesComponent() {
        return cy.get('.operations-statuses');
    }

    static getOperationStatusHeader(iconName) {
        return OperationsStatusesComponentSteps.getOperationsStatusesComponent().find(`.operation-status-header ${iconName}`);
    }

    static getImportOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.ri-download-2-line');
    }

    static getQueriesOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.ri-arrow-left-right-line');
    }

    static getBackupAndRestoreOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.ri-archive-line');
    }

    static getClusterOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.ri-organization-chart');
    }

    static getOperationStatuses() {
        return cy.get('.operation-status-content');
    }

    static openOperationStatusesDialog() {
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().click();
    }
}
