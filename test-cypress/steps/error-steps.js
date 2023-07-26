export class ErrorSteps {
    static getErrorElement() {
        return cy.get('.idError');
    }

    static verifyError(errorMessage) {
        ErrorSteps.getErrorElement().contains(errorMessage);
    }
}
