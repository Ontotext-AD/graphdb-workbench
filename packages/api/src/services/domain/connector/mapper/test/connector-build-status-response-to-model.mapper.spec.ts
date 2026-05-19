import {mapConnectorBuildStatusResponseToModel} from '../connector-build-status-response-to-model.mapper';
import {SparqlResultsResponse} from '../../../../../models/sparql';
import {ConnectorBuildStatus} from '../../../../../models/connector';

const BUILDING_STATUS_JSON = {
  status: 'BUILDING',
  processedEntities: 50,
  estimatedEntities: 100,
  indexedEntities: 40,
  entitiesPerSecond: 100,
  etaSeconds: 60,
  repair: false,
};

function makeResponse(statusValue: string): SparqlResultsResponse {
  return {results: {bindings: [{status: {value: statusValue, type: 'literal', datatype: 'application/json'}}]}};
}

describe('mapConnectorBuildStatusResponseToModel', () => {
  test('should map a valid SPARQL response to a ConnectorBuildStatus', () => {
    const result = mapConnectorBuildStatusResponseToModel(makeResponse(JSON.stringify(BUILDING_STATUS_JSON)));

    expect(result).toBeInstanceOf(ConnectorBuildStatus);
    expect(result!.status).toBe('BUILDING');
    expect(result!.processedEntities).toBe(50);
    expect(result!.estimatedEntities).toBe(100);
    expect(result!.indexedEntities).toBe(40);
    expect(result!.entitiesPerSecond).toBe(100);
    expect(result!.etaSeconds).toBe(60);
    expect(result!.repair).toBe(false);
    expect(result!.percentDone).toBe(50);
  });

  test('should return null when bindings are empty', () => {
    const response: SparqlResultsResponse = {results: {bindings: []}};
    expect(mapConnectorBuildStatusResponseToModel(response)).toBeNull();
  });

  test('should return null when the status binding is absent', () => {
    const response: SparqlResultsResponse = {
      results: {bindings: [{other: {value: 'x', type: 'literal', datatype: 'application/json'}}]},
    };
    expect(mapConnectorBuildStatusResponseToModel(response)).toBeNull();
  });

  test('should return null when the status value is not valid JSON', () => {
    expect(mapConnectorBuildStatusResponseToModel(makeResponse('not-valid-json'))).toBeNull();
  });

  test('should return null when response is null', () => {
    expect(mapConnectorBuildStatusResponseToModel(null as unknown as SparqlResultsResponse)).toBeNull();
  });

  test('should correctly map a BUILT status', () => {
    const builtJson = {...BUILDING_STATUS_JSON, status: 'BUILT', processedEntities: 100};
    const result = mapConnectorBuildStatusResponseToModel(makeResponse(JSON.stringify(builtJson)));

    expect(result).toBeInstanceOf(ConnectorBuildStatus);
    expect(result!.isBuilt).toBe(true);
    expect(result!.percentDone).toBe(100);
  });

  test('should correctly map repair flag', () => {
    const repairJson = {...BUILDING_STATUS_JSON, repair: true};
    const result = mapConnectorBuildStatusResponseToModel(makeResponse(JSON.stringify(repairJson)));

    expect(result!.repair).toBe(true);
  });
});
