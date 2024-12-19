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
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.icon-exchange');
    }

    static getBackupAndRestoreOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.fa.fa-archive');
    }

    static getClusterOperationStatusHeaderElement() {
        return OperationsStatusesComponentSteps.getOperationStatusHeader('.fa.fa-sitemap');
    }

    static getOperationStatuses() {
        return cy.get('.operation-status-content');
    }

    static openOperationStatusesDialog() {
        OperationsStatusesComponentSteps.getOperationsStatusesComponent().click();
    }

    static checkOperationElementUrl(expectedUrl, operationIndex = 0) {
        OperationsStatusesComponentSteps.getOperationStatuses().eq(operationIndex).then(($operationElement) => {
            expect($operationElement).to.have.attr('target', '_blank');
            expect($operationElement).to.have.attr('href', expectedUrl);
        });
    }
}
