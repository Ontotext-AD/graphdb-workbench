import {MonitoringService} from '../monitoring.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {OperationStatusSummary} from '../../../models/monitoring';
import {MapperProvider} from '../../../providers';
import {OperationSummaryMapper} from '../mapper/operation-summary-mapper';

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;
  window.crypto.randomUUID = jest.fn();

  beforeEach(() => {
    monitoringService = new MonitoringService();
  });

  test('should fetch and map operations for a specific repository', async () => {
    // Given, I have a mocked JSON response
    const mockOperationsJson = {
      status: 'INFORMATION', allRunningOperations: [
        {value: '25', status: 'INFORMATION', type: 'queries'},
        {value: '1', status: 'INFORMATION', type: 'updates'},
        {value: '1', status: 'CRITICAL', type: 'imports'},
        {value: 'CREATE_BACKUP_IN_PROGRESS', status: 'WARNING', type: 'backupAndRestore'},
        {value: 'UNAVAILABLE_NODES', status: 'WARNING', type: 'clusterHealth'}
      ]
    } as unknown as OperationStatusSummary;
    TestUtil.mockResponse(new ResponseMock('rest/monitor/repository/123/operations').setResponse(mockOperationsJson));

    // When I call the getOperations method
    const result = await monitoringService.getOperations('123');

    // Then, I should get a OperationStatusSummary instance, with mapped property values
    expect(result).toBeInstanceOf(OperationStatusSummary);
    expect(result).toEqual(MapperProvider.get(OperationSummaryMapper).mapToModel(mockOperationsJson));
  });
});
