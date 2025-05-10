export class SavedQueriesStubs {
  static spyGetSavedQueries() {
    cy.intercept('GET', '/rest/sparql/saved-queries').as('getSavedQueries');
  }
}
