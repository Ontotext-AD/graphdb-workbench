export interface RepositorySizeInfoResponse {
  /**
   * Number of inferred triples.
   */
  inferred: number;
  /**
   * Number of all triples.
   */
  total: number;
  /**
   * Number of explicit triples.
   */
  explicit: number;
}
