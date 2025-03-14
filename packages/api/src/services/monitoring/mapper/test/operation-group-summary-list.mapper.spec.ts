import {OperationGroupSummary, OperationGroupSummaryList} from '../../../../models/monitoring';
import {OperationGroupSummaryListMapper} from '../operation-group-summary-list.mapper';

describe('OperationGroupSummaryListMapper', () => {
  window.crypto.randomUUID = jest.fn();
  let mapper: OperationGroupSummaryListMapper;

  beforeEach(() => {
    mapper = new OperationGroupSummaryListMapper();
  });

  test('should correctly map an array of OperationGroupSummary objects', () => {
    // Given, I have an array of OperationGroupSummary objects.
    const operationGroupSummaries = [
      new OperationGroupSummary({
        group: 'group1',
        totalOperations: 10,
        status: 'INFORMATION'
      } as unknown as OperationGroupSummary),
      new OperationGroupSummary({
        group: 'group2',
        totalOperations: 5,
        status: 'WARNING'
      } as unknown as OperationGroupSummary)
    ];

    // When, I map the array to an OperationGroupSummaryList.
    const result = mapper.mapToModel(operationGroupSummaries);

    // Then, I should get an OperationGroupSummaryList containing the same data.
    expect(result).toBeInstanceOf(OperationGroupSummaryList);
    expect(result.getItems()).toEqual(operationGroupSummaries);
  });
});
