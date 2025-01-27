const VIEW_URL = '/graphql/endpoints';

export class GraphqlEndpointManagementSteps {

    static visit() {
        return cy.visit(VIEW_URL);
    }

    static getView() {
        return cy.get('.graphql-endpoint-management-view');
    }

    static getEndpointFilterField() {
        return this.getView().find('.endpoints-filter-field');
    }

    static getCreateEndpointButton() {
        return this.getView().find('.create-endpoint-btn');
    }

    static getImportEndpointSchemaDefinitionButton() {
        return this.getView().find('.import-schema-definition-btn');
    }

    static getEndpointTable() {
        return this.getView().find('.endpoints-info-table');
    }

    static getEndpointsInfo() {
        return this.getEndpointTable().find('tbody tr');
    }
}
