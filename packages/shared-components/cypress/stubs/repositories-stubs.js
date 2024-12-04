export class RepositoriesStubs {
  static stubLoadAllRepositories(fixture = '/repositories/get-all-repositories.json', delay= 0) {
    cy.intercept('GET', '/rest/repositories/all', {
      fixture: fixture,
      statusCode: 200,
      delay: delay
    }).as('get-all-repositories');
  }
}
