/**
 * Graph settings used when computing the graph for a SPARQL query.
 *
 * In visual graph these come from the graph-config settings, which are not present for reactodia,
 * so these mirror the legacy default settings.
 */
export interface GraphExploreSettings {
  /** Whether to include inferred statements when evaluating the query. */
  includeInferred: boolean;
  /** Whether to enable owl:sameAs expansion when evaluating the query. */
  sameAs: boolean;
  /** Preferred label languages; empty means no restriction. */
  languages: string[];
  /** Maximum number of links to return. */
  linksLimit: number;
}
