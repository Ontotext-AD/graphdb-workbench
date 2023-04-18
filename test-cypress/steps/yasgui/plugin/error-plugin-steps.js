export class ErrorPluginSteps {

    static getErrorPlugin() {
        return cy.get('.error-response-plugin');
    }

    static getErrorPluginBody() {
        return ErrorPluginSteps.getErrorPlugin().find('.error-response-plugin-body');
    }
}
