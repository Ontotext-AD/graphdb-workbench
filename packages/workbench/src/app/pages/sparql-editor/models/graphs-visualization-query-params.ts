/**
 * Query parameters used to configure the graph visualization view.
 */
export interface GraphsVisualizationQueryParams {
  /**
   * The SPARQL query to execute for generating the visualization.
   */
  query?: string;

  /**
   * Whether to enable owl:sameAs expansion during query evaluation.
   */
  sameAs?: boolean;

  /**
   * Whether to enable inference when executing the query.
   */
  inference?: boolean;

  /**
   * The identifier of a predefined visualization configuration to apply.
   */
  config?: string;
}
