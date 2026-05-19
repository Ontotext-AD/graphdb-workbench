import {MapperFn} from '../../../../providers';
import {ConnectorBuildStatus} from '../../../../models/connector/connector-build-status';
import {SparqlResultsResponse} from '../../../../models/sparql';
import {ConnectorBuildStatusResponse} from '../../../../models/connector/connector-build-status-response';

/**
 * Maps the SPARQL response from the connector status query to a {@link ConnectorBuildStatus} model.
 *
 * The `?status` binding value is a JSON-encoded {@link ConnectorBuildStatusResponse}.
 * Returns null if the binding is absent or the JSON cannot be parsed.
 */
export const mapConnectorBuildStatusResponseToModel: MapperFn<SparqlResultsResponse, ConnectorBuildStatus | null> = (response) => {
  const statusValue = response?.results?.bindings?.[0]?.['status']?.value;
  if (!statusValue) {
    return null;
  }
  try {
    const r = JSON.parse(statusValue) as ConnectorBuildStatusResponse;
    return new ConnectorBuildStatus(r.status, r.processedEntities, r.estimatedEntities, r.indexedEntities, r.entitiesPerSecond, r.etaSeconds, r.repair);
  } catch {
    return null;
  }
};
