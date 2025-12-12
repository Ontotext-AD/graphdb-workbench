import {MonitoringService} from '../monitoring.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {OperationStatusSummary} from '../../../models/monitoring';
import {mapOperationSummaryResponseToModel} from '../mapper/operation-summary-mapper';
import {createOperationStatusSummaryResponse} from './operation-response-test-util';

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;

  beforeEach(() => {
    monitoringService = new MonitoringService();
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
});
