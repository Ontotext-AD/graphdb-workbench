import {OperationSummaryMapper} from '../operation-summary-mapper';
import {
  OperationStatus,
  OperationStatusSummary,
  OperationType
} from '../../../../models/monitoring';

describe('OperationSummaryMapper', () => {
  let mapper: OperationSummaryMapper;

  beforeEach(() => {
    mapper = new OperationSummaryMapper();
  });

  test('should correctly map a OperationStatusSummary object', () => {
    // Given, I have a operationSummary JSON object.
    const operationStatusSummary = {
      status: OperationStatus.WARNING,
      allRunningOperations: [
        {
          type: OperationType.CLUSTER_HEALTH,
          status: OperationStatus.WARNING,
          value: 'UNAVAILABLE_NODES',
        },
        {
          type: OperationType.BACKUP_AND_RESTORE,
          status: OperationStatus.INFORMATION,
          value: 'BACKUP_IN_PROGRESS',
        }
      ]
    } as unknown as OperationStatusSummary;

    // When, I map the object to a OperationSummary.
    const result = mapper.mapToModel(operationStatusSummary);

    // Then, I should get the same object.
    expect(result).toBeInstanceOf(OperationStatusSummary);
    expect(result.status).toEqual(operationStatusSummary.status);
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
