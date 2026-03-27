import {MonitoringService} from '../monitoring.service';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {OperationStatusSummary} from '../../../../models/monitoring';
import {mapOperationSummaryResponseToModel} from '../mapper/operation-summary-mapper';
import {createOperationStatusSummaryResponse} from './operation-response-test-util';
import {HttpErrorResponse} from '../../../../models/http';

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;

  beforeEach(() => {
    monitoringService = new MonitoringService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  test('should fetch and map operations for a specific repository', async () => {
    // Given, I have a mocked JSON response
    const operationsResponse = createOperationStatusSummaryResponse();
    TestUtil.mockResponse(new ResponseMock('rest/monitor/repository/123/operations').setResponse(operationsResponse));

    // When I call the getOperations method
    const result = await monitoringService.getOperations('123');

    // Then, I should get a OperationStatusSummary instance, with mapped property values
    expect(result).toBeInstanceOf(OperationStatusSummary);
    expect(result).toEqual(mapOperationSummaryResponseToModel(operationsResponse));
  });

  describe('deleteQuery', () => {
    const MONITORING_ENDPOINT = 'rest/monitor';

    it('should delete a query for a given repository', async () => {
      const queryId = 'SELECT * WHERE { ?s ?p ?o }';
      const repositoryId = 'repo1';
      const encodedQueryId = encodeURIComponent(queryId);
      const expectedUrl = `${MONITORING_ENDPOINT}/repository/${repositoryId}/query?query=${encodedQueryId}`;

      TestUtil.mockResponse(
        new ResponseMock(expectedUrl).setStatus(204)
      );

      await monitoringService.deleteQuery(queryId, repositoryId);

      // Then the request should have been made with the DELETE method
      const request = TestUtil.getRequest(expectedUrl);
      expect(request).toBeDefined();
      expect(request?.method).toBe('DELETE');
    });

    it('should correctly encode special characters in the query ID', async () => {
      const queryId = 'SELECT ?s WHERE { ?s <http://example.org/p> "value" }';
      const repositoryId = 'repo2';
      const encodedQueryId = encodeURIComponent(queryId);
      const expectedUrl = `${MONITORING_ENDPOINT}/repository/${repositoryId}/query?query=${encodedQueryId}`;

      TestUtil.mockResponse(
        new ResponseMock(expectedUrl).setStatus(204)
      );

      await monitoringService.deleteQuery(queryId, repositoryId);

      // Then the URL should contain the properly encoded query ID
      const request = TestUtil.getRequest(expectedUrl);
      expect(request).toBeDefined();
      expect(request?.method).toBe('DELETE');
    });

    it('should include the repository ID in the request URL', async () => {
      const queryId = 'myQuery';
      const repositoryId = 'my-special-repo';
      const expectedUrl = `${MONITORING_ENDPOINT}/repository/${repositoryId}/query?query=${encodeURIComponent(queryId)}`;

      TestUtil.mockResponse(
        new ResponseMock(expectedUrl).setStatus(204)
      );

      await monitoringService.deleteQuery(queryId, repositoryId);

      // Then the request URL should reference the correct repository
      const request = TestUtil.getRequest(expectedUrl);
      expect(request).toBeDefined();
    });

    it('should reject when the server returns an error response', async () => {
      const queryId = 'nonExistentQuery';
      const repositoryId = 'repo1';
      const expectedUrl = `${MONITORING_ENDPOINT}/repository/${repositoryId}/query?query=${encodeURIComponent(queryId)}`;

      TestUtil.mockResponse(
        new ResponseMock(expectedUrl)
          .setStatus(500)
          .setMessage('Internal Server Error')
      );

      await expect(monitoringService.deleteQuery(queryId, repositoryId)).rejects.toBeInstanceOf(HttpErrorResponse);
    });
  });
});
