/**
 * Payload for the `rest/explore-graph/graph` endpoint that computes the graph for a SPARQL query.
 */
export interface GraphExploreRequest {
  /** The SPARQL query to compute the graph for. */
  query: string;
  /** Maximum number of links to return. */
  linksLimit?: number;
  /** Preferred label languages; empty means no restriction. */
  languages: string[];
  /** Whether to include inferred statements when evaluating the query. */
  includeInferred: boolean;
  /** Whether to enable owl:sameAs expansion when evaluating the query. */
  sameAsState: boolean;
}
