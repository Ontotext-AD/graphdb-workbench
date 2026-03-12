/**
 * Holds all possible values of the SPARQL queries.
 */
export enum QueryType {
  'SELECT' = 'SELECT',
  'CONSTRUCT' = 'CONSTRUCT',
  'ASK' = 'ASK',
  'DESCRIBE' = 'DESCRIBE',
  'INSERT' = 'INSERT',
  'DELETE' = 'DELETE',
  'LOAD' = 'LOAD',
  'CLEAR' = 'CLEAR',
  'CREATE' = 'CREATE',
  'DROP' = 'DROP',
  'COPY' = 'COPY',
  'MOVE' = 'MOVE',
  'ADD' = 'ADD'
}
