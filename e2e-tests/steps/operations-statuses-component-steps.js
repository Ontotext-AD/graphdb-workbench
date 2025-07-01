import {BrowserStubs} from "../stubs/browser-stubs";

export class OperationsStatusesComponentSteps {

    static getOperationsStatusesComponent() {
        return cy.get('.operations-statuses');
    }

    static getOperationStatusHeader(iconName) {
        return OperationsStatusesComponentSteps.getOperationsStatusesComponent().find(`.operation-status-header ${iconName}`);
    }

    static getImportOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.icon-import');
    }

    static getQueriesOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.fa-arrow-right-arrow-left');
    }

    static getBackupAndRestoreOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.fa-archive');
    }

    static getClusterOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.fa-sitemap');
    }

    static getOperationStatuses() {
        return cy.get('.operation-status-content');
    }

    static openOperationStatusesDialog() {
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().click();
    }
}
