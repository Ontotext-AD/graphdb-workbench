export class CreateGraphqlEndpointSteps {
    static visit() {
        return cy.visit('/graphql/endpoint/create');
    }

    static getView() {
        return cy.get('.create-graphql-endpoint-view');
    }

    static getSourceRepositorySelector() {
        return this.getView().find('.source-repository-selector');
    }

    static getSelectedSourceRepository() {
        return this.getSourceRepositorySelector().find('option:selected');
    }

    static getActiveStep() {
        return this.getView().find('.wizard-step.active');
    }

    static getSelectSchemaSourceView() {
        return this.getView().find('.select-schema-source-view');
    }

    static getSchemaSourceTypes() {
        return this.getSelectSchemaSourceView().find('.schema-source-type input[type=radio]');
    }

    static getSelectedSchemaSource() {
        return this.getSelectSchemaSourceView().find('.schema-source-type input[type=radio]:checked');
    }

    static cancelEndpointCreation() {
        this.getView().find('.cancel-btn').click();
    }
}
