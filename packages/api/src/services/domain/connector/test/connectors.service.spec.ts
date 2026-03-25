import {ConnectorsService} from '../connectors.service';
import {BeforeUpdateQueryResult, BeforeUpdateQueryResultStatus, ConnectorCommand} from '../../../../models/connector';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {UnknownConnectorCommandError} from '../error/unknown-connector-command-error';
import {ConnectorResponse} from '../response/connector-response';

const CONNECTORS_CHECK_ENDPOINT = 'rest/connectors/check';

describe('ConnectorsService', () => {
  let connectorsService: ConnectorsService;

  beforeEach(() => {
    connectorsService = new ConnectorsService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('checkConnector', () => {
    test('should return SUCCESS result with no message when response has no command', async () => {
      // Given a response with no command field
      const response: ConnectorResponse = {
        command: '',
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'http://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector
      const result = await connectorsService.checkConnector();

      // Then it should return a BeforeUpdateQueryResult with SUCCESS status and no message label
      expect(result).toBeInstanceOf(BeforeUpdateQueryResult);
      expect(result.status).toBe(BeforeUpdateQueryResultStatus.SUCCESS);
      expect(result.command).toBe('');
      expect(result.messageLabelKey).toBeUndefined();
      expect(result.iri).toBe('http://example.org/connector');
    });

    test('should return ERROR result with inactive plugin message when connector has no support', async () => {
      // Given a response with a command but no support
      const response: ConnectorResponse = {
        command: ConnectorCommand.CREATE,
        hasSupport: false,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'http://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector
      const result = await connectorsService.checkConnector();

      // Then it should return a BeforeUpdateQueryResult with ERROR status and inactive plugin message
      expect(result).toBeInstanceOf(BeforeUpdateQueryResult);
      expect(result.status).toBe(BeforeUpdateQueryResultStatus.ERROR);
      expect(result.command).toBe(ConnectorCommand.CREATE);
      expect(result.messageLabelKey).toBe('query.editor.inactive.plugin.warning.msg');
      expect(result.parameters).toEqual([{connectorName: 'lucene'}, {pluginName: 'lucene-plugin'}]);
      expect(result.iri).toBe('http://example.org/connector');
    });

    test('should return SUCCESS result with created.connector message for CREATE command', async () => {
      // Given a response with a CREATE command and support
      const response: ConnectorResponse = {
        command: ConnectorCommand.CREATE,
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'http://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector
      const result = await connectorsService.checkConnector();

      // Then it should return a BeforeUpdateQueryResult with SUCCESS status and created connector message
      expect(result).toBeInstanceOf(BeforeUpdateQueryResult);
      expect(result.status).toBe(BeforeUpdateQueryResultStatus.SUCCESS);
      expect(result.command).toBe(ConnectorCommand.CREATE);
      expect(result.messageLabelKey).toBe('created.connector');
      expect(result.parameters).toEqual([{name: 'my-connector'}]);
      expect(result.iri).toBe('http://example.org/connector');
    });

    test('should return SUCCESS result with repaired connector message for REPAIR command', async () => {
      // Given a response with a REPAIR command and support
      const response: ConnectorResponse = {
        command: ConnectorCommand.REPAIR,
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'http://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector
      const result = await connectorsService.checkConnector();

      // Then it should return a BeforeUpdateQueryResult with SUCCESS status and repaired connector message
      expect(result).toBeInstanceOf(BeforeUpdateQueryResult);
      expect(result.status).toBe(BeforeUpdateQueryResultStatus.SUCCESS);
      expect(result.command).toBe(ConnectorCommand.REPAIR);
      expect(result.messageLabelKey).toBe('query.editor.repaired.connector');
      expect(result.parameters).toEqual([{name: 'my-connector'}]);
      expect(result.iri).toBe('http://example.org/connector');
    });

    test('should return SUCCESS result with delete success message for DROP command', async () => {
      // Given a response with a DROP command and support
      const response: ConnectorResponse = {
        command: ConnectorCommand.DROP,
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'http://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector
      const result = await connectorsService.checkConnector();

      // Then it should return a BeforeUpdateQueryResult with SUCCESS status and delete success message
      expect(result).toBeInstanceOf(BeforeUpdateQueryResult);
      expect(result.status).toBe(BeforeUpdateQueryResultStatus.SUCCESS);
      expect(result.command).toBe(ConnectorCommand.DROP);
      expect(result.messageLabelKey).toBe('externalsync.delete.success.msg');
      expect(result.parameters).toEqual([{name: 'my-connector'}]);
      expect(result.iri).toBe('http://example.org/connector');
    });

    test('should throw UnknownConnectorCommandError for an unrecognised command', async () => {
      // Given a response with an unknown command and support
      const response: ConnectorResponse = {
        command: 'unsupported-command',
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'http://example.org/connector',
        order: 1,
      };
      TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

      // When the service checks the connector, then it should throw an UnknownConnectorCommandError
      await expect(connectorsService.checkConnector()).rejects.toThrow(UnknownConnectorCommandError);
      await expect(connectorsService.checkConnector()).rejects.toThrow('Unknown connector command: unsupported-command');
    });

    test('should pass the query string to the REST endpoint when provided', async () => {
      // Given a response for a CREATE command
      const response: ConnectorResponse = {
        command: ConnectorCommand.CREATE,
        hasSupport: true,
        connectorName: 'lucene',
        pluginName: 'lucene-plugin',
        name: 'my-connector',
        iri: 'http://example.org/connector',
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

    test('should always set the iri on the result regardless of command', async () => {
      // Given responses with different commands but the same iri
      const iri = 'http://example.org/my-unique-connector';
      const responses: ConnectorResponse[] = [
        {command: '', hasSupport: true, connectorName: 'c', pluginName: 'p', name: 'n', iri, order: 1},
        {command: ConnectorCommand.CREATE, hasSupport: true, connectorName: 'c', pluginName: 'p', name: 'n', iri, order: 1},
        {command: ConnectorCommand.REPAIR, hasSupport: true, connectorName: 'c', pluginName: 'p', name: 'n', iri, order: 1},
        {command: ConnectorCommand.DROP, hasSupport: true, connectorName: 'c', pluginName: 'p', name: 'n', iri, order: 1},
      ];

      for (const response of responses) {
        TestUtil.mockResponse(new ResponseMock(CONNECTORS_CHECK_ENDPOINT).setResponse(response));

        // When the service checks the connector
        const result = await connectorsService.checkConnector();

        // Then the iri should always be set on the result
        expect(result.iri).toBe(iri);
      }
    });
  });
});

