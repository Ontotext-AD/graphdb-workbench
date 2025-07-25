export class ErrorSteps {

    static getRepositoryErrors() {
        return cy.get('.card.repository-errors')
    }

    static verifyError(errorMessage) {
        ErrorSteps.getRepositoryErrors().contains(errorMessage);
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
