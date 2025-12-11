import {OperationStatus, OperationStatusSummary, OperationType} from '../../../models/monitoring';
import {mapOperationSummaryResponseToModel} from '../mapper/operation-summary-mapper';
import {createOperationStatusSummaryResponse} from './operation-response-test-util';

describe('OperationSummaryMapper', () => {
  test('should correctly map a OperationStatusSummaryResponse object', () => {
    // Given, I have a operationSummary JSON object.
    const operationStatusSummaryResponse = createOperationStatusSummaryResponse();

    // When, I map the object to a OperationSummary.
    const result = mapOperationSummaryResponseToModel(operationStatusSummaryResponse);

    // Then, I should get the same object.
    expect(result).toBeInstanceOf(OperationStatusSummary);
    expect(result.status).toEqual(operationStatusSummaryResponse.status);
    expect(result.allRunningOperations.getItems()[0]).toEqual({
      count: 0,
      group: 'CLUSTER',
      href: 'cluster',
      id: 'WARNING-clusterHealth-UNAVAILABLE_NODES',
      value: 'UNAVAILABLE_NODES',
      labelKey: 'UNAVAILABLE_NODES',
      status: OperationStatus.WARNING,
      type: OperationType.CLUSTER_HEALTH,
    });
    expect(result.allRunningOperations.getItems()[1]).toEqual({
      count: 0,
      group: 'BACKUP',
      href: 'monitor/backup-and-restore',
      id: 'INFORMATION-backupAndRestore-BACKUP_IN_PROGRESS',
      value: 'BACKUP_IN_PROGRESS',
      labelKey: 'BACKUP_IN_PROGRESS',
      status: OperationStatus.INFORMATION,
      type: OperationType.BACKUP_AND_RESTORE,
    });
  });
});
