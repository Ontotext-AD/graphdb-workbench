/**
 * A single link (edge) in the `rest/explore-graph/graph` response.
 */
export interface GraphExploreLinkResponse {
  /** Source element IRI. */
  source: string;
  /** Target element IRI. */
  target: string;
  /** Display/short predicate values for the relationship(s). */
  predicates: string[];
  /** Full (absolute) predicate IRIs. */
  rawPredicates: string[];
}
