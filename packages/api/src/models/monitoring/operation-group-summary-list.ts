import {ModelList} from '../common';
import {OperationGroupSummary} from './operation-group-summary';

/**
 * Represents a list of operation group summaries.
 */
export class OperationGroupSummaryList extends ModelList<OperationGroupSummary> {
  /**
   * Creates a new instance of OperationGroupSummaryList.
   *
   * @param operationGroupSummaries - An optional array of OperationGroupSummary objects to initialize the list.
   *                                  If not provided, an empty list will be created.
   */
  constructor(operationGroupSummaries?: OperationGroupSummary[]) {
    super(operationGroupSummaries);
  }
}
