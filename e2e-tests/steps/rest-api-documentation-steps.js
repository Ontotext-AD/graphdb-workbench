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

    static getSwaggerDocument() {
        return this.getRestApiContent().its('0.contentDocument');
    }

    static getSwaggerRoot() {
        return this.getSwaggerDocument().its('documentElement');
    }

    static waitForSwaggerUi() {
        // The iframe starts with an empty document; wait until Swagger UI has rendered the API operations.
        this.getSwaggerDocument().find('.opblock-tag').should('have.length.greaterThan', 0);
    }

    static verifySwaggerDarkTheme() {
        this.waitForSwaggerUi();
        this.getSwaggerRoot().should('have.class', 'dark-mode');
    }

    static verifySwaggerLightTheme() {
        this.waitForSwaggerUi();
        this.getSwaggerRoot().should('not.have.class', 'dark-mode');
    }
}
