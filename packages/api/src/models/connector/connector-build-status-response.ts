/**
 * Raw JSON shape returned by the connector status SPARQL query.
 * The `status` binding value is a JSON-encoded string of this interface.
 */
export interface ConnectorBuildStatusResponse {
  status: string;
  processedEntities: number;
  estimatedEntities: number;
  indexedEntities: number;
  entitiesPerSecond: number;
  etaSeconds: number;
  repair: boolean;
}
