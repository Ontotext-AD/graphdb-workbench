/**
 * A single link (edge) in the `rest/explore-graph/graph` response.
 */
export interface GraphExploreLinkResponse {
  /** Source element IRI. */
  source: string;
  /** Target element IRI. */
  target: string;
  /** Full predicate IRIs of the relationship(s) between source and target. */
  predicates: string[];
  /** Raw (absolute) IRIs. */
  rawPredicates: string[];
}
