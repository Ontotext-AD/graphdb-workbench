/**
 * A single typed value within a SPARQL result binding (SPARQL 1.1 JSON format).
 */
export interface SparqlValue {
  value: string;
  type: string;
  datatype: string;
}

/**
 * One row of a SPARQL result, keyed by variable name.
 */
export type SparqlBinding = Record<string, SparqlValue>;

/**
 * Top-level shape of a SPARQL query JSON response.
 */
export interface SparqlResultsResponse {
  results: {
    bindings: SparqlBinding[];
  };
}
