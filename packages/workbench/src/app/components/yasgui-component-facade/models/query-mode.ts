/**
 * Holds all possible modes of a SPARQL query.
 */
export enum QueryMode {
  /**
   * All queries that change statements in the repository.
   * UPDATE queries are INSERT, DELETE, LOAD, CLEAR, CREATE, DROP, COPY, MOVE, and ADD.
   */
  'UPDATE' = 'update',

  /**
   * All queries that just search (do not modify the repository).
   * QUERY queries are SELECT, CONSTRUCT, ASK, DESCRIBE
   */
  'QUERY' = 'query'
}
