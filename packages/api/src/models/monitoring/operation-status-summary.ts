import {Model} from '../common';
import {OperationStatus, STATUS_ORDER} from './operation-status';
import {OperationList} from './operation-list';
import {OperationGroup} from './operation-group';
import {OperationGroupSummary} from './operation-group-summary';

/**
 * Model of the summary of operation statuses.
 *
 * Holds the status of the entire operation list and a list of individual operations.
 * Currently, these could be backup, sparql querying and cluster operations
 */
export class OperationStatusSummary extends Model<OperationStatusSummary> {
  status: OperationStatus;
  allRunningOperations: OperationList;

  constructor(operationStatusSummary: OperationStatusSummary) {
    super();
    this.status = operationStatusSummary.status || OperationStatus.INFORMATION;
    this.allRunningOperations = operationStatusSummary.allRunningOperations;
  }

  /**
   * Transforms the OperationStatusSummary data into a grouped summary format.
   * This function aggregates operations by their group, calculates total operations per group,
   * and determines the highest severity status for each group.
   *
   * @returns {OperationGroupSummary[]} A mapped list of operation group summaries with aggregated statistics
   */
  toOperationsGroupSummary(): OperationGroupSummary[] {
    const groupToOperationSummary = new Map<OperationGroup, OperationGroupSummary>();

    this.allRunningOperations.getItems().forEach((operation) => {
      if (!groupToOperationSummary.has(operation.group)) {
        groupToOperationSummary.set(operation.group, new OperationGroupSummary({
          group: operation.group,
          totalOperations: 0,
          status: OperationStatus.INFORMATION
        } as OperationGroupSummary));
      }

      const summary = groupToOperationSummary.get(operation.group)!;
      summary.totalOperations += operation.count;

      if (STATUS_ORDER[operation.status] > STATUS_ORDER[summary.status]) {
        summary.status = operation.status;
      }
    });

    return Array.from(groupToOperationSummary.values());
  }
}
