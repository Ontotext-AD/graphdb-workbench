export class ToasterSteps {
    static getToast() {
        return cy.get('.toast');
    }

    static verifyTitle(title) {
        return ToasterSteps.getToast()
            .find('.toast-title')
            .should('be.visible')
            .and('contain', title);
    }

    static verifySuccess(successMessage) {
        return ToasterSteps.getToast()
            .should('exist')
            .find('.toast-message')
            .and('contain', successMessage);
    }

    static verifyWarning(warningMessage) {
        return ToasterSteps.getToast()
            .find('.toast-warning')
            .should('be.visible')
            .find('.toast-message')
            .and('contain', warningMessage);
    }

    static verifyError(errorMessage) {
        return ToasterSteps.getToast()
            .should('be.visible')
            .and('have.class', 'toast-error')
            .find('.toast-message')
            .and('contain', errorMessage);
    }

    static verifyNewToasterError(errorMessage) {
        return ToasterSteps.getToast()
            .should('be.visible')
            .and('have.class', 'toast error')
            .find('.toast-message')
            .and('contain', errorMessage);
    }
}
