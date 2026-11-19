import {ConnectorsService} from '../connectors.service';
import {ConnectorBuildStatus, ConnectorCheckResult, ConnectorCommand} from '../../../../models/connector';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {ConnectorResponse} from '../response/connector-response';
import {Rdf4jRepositoryService} from '../../rdf4j/rdf4j-repository.service';
import {SparqlResultsResponse} from '../../../../models/sparql';

const CONNECTORS_CHECK_ENDPOINT = 'rest/connectors/check';
const REPOSITORY_ID = 'test-repo';

describe('ConnectorsService', () => {
  let connectorsService: ConnectorsService;

  beforeEach(() => {
    connectorsService = new ConnectorsService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('checkConnector', () => {
    test('should return a result without a command when the query is not a connector command', async () => {
      // Given a response with no command field
      const response: ConnectorResponse = {
        command: '',
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'https://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector
      const result = await connectorsService.checkConnector();

      // Then the result has no command
      expect(result).toBeInstanceOf(ConnectorCheckResult);
      expect(result.command).toBeUndefined();
    });

    test('should keep the connector data of a connector command', async () => {
      // Given a response with a CREATE command for a connector whose plugin is not active
      const response: ConnectorResponse = {
        command: ConnectorCommand.CREATE,
        hasSupport: false,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'https://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector
      const result = await connectorsService.checkConnector();

      // Then the result holds the command and the connector data
      expect(result).toEqual(new ConnectorCheckResult({
        command: ConnectorCommand.CREATE,
        hasSupport: false,
        connectorType: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'https://example.org/connector',
      }));
    });

    test.each([ConnectorCommand.CREATE, ConnectorCommand.REPAIR, ConnectorCommand.DROP])(
      'should return the %s command',
      async (command) => {
        // Given a response with a known command
        const response: ConnectorResponse = {
          command,
          hasSupport: true,
          connectorName: 'lucene',
          pluginName: 'lucene-plugin',
          name: 'my-connector',
          iri: 'https://example.org/connector',
          order: 1,
        };
        TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

        // When the service checks the connector
        const result = await connectorsService.checkConnector();

        // Then the result has the same command
        expect(result.command).toBe(command);
      });

    test('should throw for an unrecognised command', async () => {
      // Given a response with an unknown command and support
      const response: ConnectorResponse = {
        command: 'unsupported-command',
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'https://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector, then it should throw
      await expect(connectorsService.checkConnector()).rejects.toThrow('Invalid enum value \'unsupported-command\'');
    });

    test('should pass the query string to the REST endpoint when provided', async () => {
      // Given a response for a CREATE command
      const response: ConnectorResponse = {
        command: ConnectorCommand.CREATE,
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'https://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));
      const sparqlQuery = 'CREATE CONNECTOR <http://example.org/connector> ...';

      // When the service checks the connector with a specific SPARQL query
      await connectorsService.checkConnector(sparqlQuery);

      // Then the query body should have been forwarded to the HTTP layer
      const capturedRequest = TestUtil.getRequest(CONNECTORS_CHECK_ENDPOINT);
      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.body).toBe(sparqlQuery);
    });
  });

  describe('getConnectorBuildStatus', () => {
    const IRI = 'https://www.ontotext.com/connectors/lucene/instance#my_index';
    const buildingStatus = {
      status: 'BUILDING',
      processedEntities: 50,
      estimatedEntities: 100,
      indexedEntities: 40,
      entitiesPerSecond: 100,
      etaSeconds: 30,
      repair: false,
    };
    let executeSparqlQuerySpy: jest.SpyInstance<Promise<SparqlResultsResponse>>;

    beforeEach(() => {
      executeSparqlQuerySpy = jest.spyOn(Rdf4jRepositoryService.prototype, 'executeSparqlQuery');
    });

    test('should return a ConnectorBuildStatus when the SPARQL query returns a status binding', async () => {
      // Given a SPARQL response with a JSON-encoded status binding
      const sparqlResponse: SparqlResultsResponse = {
        results: {bindings: [{status: {value: JSON.stringify(buildingStatus), type: 'literal', datatype: 'application/json'}}]},
      };
      executeSparqlQuerySpy.mockResolvedValue(sparqlResponse);

      // When the service fetches the build status
      const result = await connectorsService.getConnectorBuildStatus(IRI, REPOSITORY_ID);

      // Then it should return a populated ConnectorBuildStatus
      expect(result).toBeInstanceOf(ConnectorBuildStatus);
      expect(result!.status).toBe('BUILDING');
      expect(result!.processedEntities).toBe(50);
      expect(result!.estimatedEntities).toBe(100);
      expect(result!.percentDone).toBe(50);
    });

    test('should return null when the SPARQL response has no bindings', async () => {
      // Given a SPARQL response with empty bindings
      executeSparqlQuerySpy.mockResolvedValue({results: {bindings: []}});

      // When the service fetches the build status
      const result = await connectorsService.getConnectorBuildStatus(IRI, REPOSITORY_ID);

      // Then it should return null
      expect(result).toBeNull();
    });

    test('should call executeSparqlQuery with the repository ID and the connector status query', async () => {
      // Given a mock for the SPARQL call
      executeSparqlQuerySpy.mockResolvedValue({results: {bindings: []}});

      // When the service fetches the build status
      await connectorsService.getConnectorBuildStatus(IRI, REPOSITORY_ID);

      const EXPECTED_QUERY = `SELECT ?status {\n\t<${IRI}> <https://www.ontotext.com/connectors/lucene#connectorStatus> ?status\n}`;
      // Then executeSparqlQuery should be called with the repository ID and the expected query
      expect(executeSparqlQuerySpy).toHaveBeenCalledWith(REPOSITORY_ID, EXPECTED_QUERY);
    });
  });
});

