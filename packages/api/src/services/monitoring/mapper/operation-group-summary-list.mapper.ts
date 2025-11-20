import {OperationGroupSummaryList} from '../../../models/monitoring/operation-group-summary-list';
import {OperationGroupSummary} from '../../../models/monitoring';
import {Mapper} from '../../../providers/mapper/mapper';
import {ensureArray, toObject, assertComplete} from '../../../providers/mapper/guards';

/**
 * Mapper class for converting an array of OperationGroupSummary objects to an OperationGroupSummaryList model.
 */
export class OperationGroupSummaryListMapper extends Mapper<OperationGroupSummaryList> {
  /**
   * Maps an array of OperationGroupSummary objects to an OperationGroupSummaryList model.
   *
   * @param data - An array of OperationGroupSummary objects to be mapped.
   * @returns A new OperationGroupSummaryList instance containing the provided data.
   */
  mapToModel(data: unknown): OperationGroupSummaryList {
    if (data instanceof OperationGroupSummaryList) {
      return data;
    }
    const rawItems = ensureArray<unknown>(data);

    const summaries = rawItems
      .map(item => {
        if (item instanceof OperationGroupSummary) {
          return item;
        }
        const partial = toObject<OperationGroupSummary>(item);
        // Fail if any required field is missing.
        const complete = assertComplete(partial, ['group', 'status', 'totalOperations']);
        return new OperationGroupSummary(complete);
      });

    return new OperationGroupSummaryList(summaries);
  }
}
