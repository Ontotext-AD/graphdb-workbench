const VIEW_URL = '/graphql-playground';

export class GraphqlPlaygroundSteps {

    static visitGraphqlPlaygroundPage() {
        return cy.visit(VIEW_URL);
    }

    static getPlayground() {
        return cy.get('.graphiql-query-editor textarea');
    }
}
