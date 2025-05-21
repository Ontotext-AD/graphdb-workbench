export class ErrorSteps {
    static getErrorElement() {
        return cy.get('.idError');
    }

    static verifyError(errorMessage) {
        ErrorSteps.getErrorElement().contains(errorMessage);
    }

    static getRepositoryErrors() {
        return cy.get('.card.repository-errors')
    }

    static getNoConnectedRepoMessage() {
        return this.getRepositoryErrors().find('.alert.lead.alert-info');
    }

    static verifyNoConnectedRepoMessage() {
        this.getRepositoryErrors().should('be.visible');
        this.getNoConnectedRepoMessage()
            .should('be.visible')
            .and('contain', 'Some functionalities are not available because you are not connected to any repository.');
    }
}
