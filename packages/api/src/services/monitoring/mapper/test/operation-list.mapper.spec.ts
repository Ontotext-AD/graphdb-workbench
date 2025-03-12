import {OperationListMapper} from '../operation-list.mapper';
import {Operation, OperationList, OperationStatus, OperationType} from '../../../../models/monitoring';

describe('OperationListMapper', () => {
  window.crypto.randomUUID = jest.fn();
  let mapper: OperationListMapper;

  beforeEach(() => {
    mapper = new OperationListMapper();
  });

  test('should correctly map an array of Operation objects', () => {
    // Given, I have an array of Operation objects.
    const operations = [
      new Operation({
        type: OperationType.CLUSTER_HEALTH,
        status: OperationStatus.WARNING,
        value: 'UNAVAILABLE_NODES',
      } as Operation),
      new Operation({
        type: OperationType.BACKUP_AND_RESTORE,
        status: OperationStatus.INFORMATION,
        value: 'BACKUP_IN_PROGRESS',
      } as Operation)
    ];

    // When, I map the array to an OperationList.
    const result = mapper.mapToModel(operations);

    // Then, I should get an OperationList containing the same data.
    expect(result).toBeInstanceOf(OperationList);
    expect(result.getItems()).toEqual(operations);
  });
});
