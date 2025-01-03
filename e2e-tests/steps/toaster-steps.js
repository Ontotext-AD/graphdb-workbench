export class ToasterSteps {
    static getToast() {
        return cy.get('#toast-container');
    }

    static verifyTitle(title) {
        ToasterSteps.getToast()
            .find('.toast-title')
            .should('be.visible')
            .and('contain', title);
    }

    static verifySuccess(successMessage) {
        ToasterSteps.getToast()
            .should('exist')
            .find('.toast-message')
            .and('contain', successMessage);
    }

    static verifyWarning(warningMessage) {
        ToasterSteps.getToast()
            .find('.toast-warning')
            .should('be.visible')
            .find('.toast-message')
            .and('contain', warningMessage);
    }

    static verifyError(errorMessage) {
        ToasterSteps.getToast()
            .find('.toast-error')
            .should('be.visible')
            .find('.toast-message')
            .and('contain', errorMessage);
    }
}
