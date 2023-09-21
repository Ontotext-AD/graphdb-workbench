export class OperationsStatusesComponentSteps {

    static getOperationsStatusesComponent() {
        return cy.get('.operations-statuses');
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
        });
    }
}
