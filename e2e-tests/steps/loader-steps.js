export class LoaderSteps {

    static getLoader() {
        return cy.get('.ot-loader-new-content');
    }

    static verifyMessage(message) {
        LoaderSteps.getLoader().contains(message);
    }
}
