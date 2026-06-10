/**
 * Options for executing a raw SPARQL request against a repository.
 */
export interface SparqlRequestOptions {
  /**
   * Value for the `Accept` header, selecting the response format, e.g.
   * `application/sparql-results+json` for SELECT/ASK or `text/turtle` for CONSTRUCT/DESCRIBE.
   * Defaults to SPARQL results JSON when omitted.
   */
  accept?: string;
}
