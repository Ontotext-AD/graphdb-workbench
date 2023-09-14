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

    static clickOnOperationStatus(operationIndex = 0) {
        OperationsStatusesComponentSteps.getOperationStatuses().eq(operationIndex).then(($operationElement) => {
            expect($operationElement).to.have.attr('target', '_blank');
            // update attr to open in same tab
            $operationElement.attr('target', '_self');
        })
            .click();
    }

    static clickOnOperationAndVerifyUrl(expectedUrl, operationIndex = 0) {
        OperationsStatusesComponentSteps.clickOnOperationStatus(operationIndex);
        cy.url().should('include', expectedUrl);
    }
}
