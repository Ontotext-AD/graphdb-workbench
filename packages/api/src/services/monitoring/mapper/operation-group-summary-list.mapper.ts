import {OperationGroupSummaryList} from '../../../models/monitoring/operation-group-summary-list';
import {OperationGroupSummary} from '../../../models/monitoring';
import {Mapper} from '../../../providers/mapper/mapper';

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
  mapToModel(data: OperationGroupSummary[]): OperationGroupSummaryList {
    return new OperationGroupSummaryList(data);
  }
}
