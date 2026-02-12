export class ErrorPageSteps {
    static visit404() {
        cy.visit('/404');
    }

    static get404Page() {
        return cy.get('app-not-found-page');
    }
}
