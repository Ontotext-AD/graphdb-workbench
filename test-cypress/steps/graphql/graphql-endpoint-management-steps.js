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

    static getEndpointLink(index) {
        return this.getEndpointsInfo().eq(index).find('.endpoint-link');
    }

    static exploreEndpoint(index) {
        this.getEndpointLink(index).click();
    }

    static toggleEndpointRow(index) {
        return this.getEndpointsInfo().eq(index).find('.toggle-row a').click();
    }

    static filterEndpoints(term) {
        this.getEndpointFilterField().type(term);
    }

    static clearFilter() {
        this.getEndpointFilterField().clear();
    }

    static getNoResultsInTableBanner() {
        return this.getEndpointTable().find('.no-results');
    }

    static getNoEndpointsInRepositoryBanner() {
        return this.getView().find('.no-endpoints');
    }

    static createEndpoint() {
        this.getView().find('.create-endpoint-btn').click();
    }

    static verifyEndpointInfo(data) {
        this.getEndpointsInfo().each(($row, index) => {
            const endpointInfo = data[index];
            cy.wrap($row).within(() => {
                cy.get('td').eq(1).should('contain', endpointInfo.id);
                cy.get('td').eq(2).should('contain', endpointInfo.label);
                cy.get('td').eq(3).should('contain', endpointInfo.default ? 'yes' : 'no');
                cy.get('td').eq(4).should('contain', endpointInfo.active ? 'yes' : 'no');
                cy.get('td').eq(5).should('contain', endpointInfo.modified);
                cy.get('td').eq(6).should('contain', endpointInfo.types);
                cy.get('td').eq(7).should('contain', endpointInfo.properties);
                cy.get('td').eq(8).find('button').should('have.length', 4);
            });
            // expand the row and check the description outside the wrapper
            this.toggleEndpointRow(index).closest('tr').next('tr')
                .find('.endpoint-description').should('contain', endpointInfo.description);
            this.toggleEndpointRow(index);
        });
    }
}
