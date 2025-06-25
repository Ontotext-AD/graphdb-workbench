import {BaseSteps} from "./base-steps";

export class RestApiDocumentationSteps extends BaseSteps {
    static visit() {
        cy.visit('webapi');
    }

    static getRestApiContent() {
        return this.getByTestId('rest-api-content');
    }

    static verifyInitialState() {
        this.getRestApiContent().should('be.visible');
    }
}
