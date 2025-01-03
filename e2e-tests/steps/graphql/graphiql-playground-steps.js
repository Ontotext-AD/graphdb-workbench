export class GraphiqlPlaygroundSteps {
  
  static getPlayground() {
    return cy.get('.graphiql-query-editor');
  }
}
