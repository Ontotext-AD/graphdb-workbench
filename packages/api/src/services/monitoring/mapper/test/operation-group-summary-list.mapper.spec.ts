import {OperationGroupSummary, OperationGroupSummaryList} from '../../../../models/monitoring';
import {mapOperationGroupSummaryListResponseToModel} from '../operation-group-summary-list.mapper';

describe('OperationGroupSummaryListMapper', () => {
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
    const result = mapOperationGroupSummaryListResponseToModel(operationGroupSummaries);

    // Then, I should get an OperationGroupSummaryList containing the same data.
    expect(result).toBeInstanceOf(OperationGroupSummaryList);
    expect(result.getItems()).toEqual(operationGroupSummaries);
  });
});
