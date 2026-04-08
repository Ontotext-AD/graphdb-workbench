/**
 * Payload object for saving a SPARQL query.
 */
export interface SaveQueryRequest {
  name: string;
  body: string;
  shared: boolean;
  inference?: boolean;
  sameAs?: boolean;
}
