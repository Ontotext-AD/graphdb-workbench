import {Model} from '../common';
import {OperationStatus, STATUS_ORDER} from './operation-status';
import {OperationList} from './operation-list';
import {MapperProvider} from '../../providers';
import {OperationListMapper} from '../../services/monitoring/mapper/operation-list.mapper';
import {OperationGroup} from './operation-group';
import {OperationGroupSummary} from './operation-group-summary';
import {OperationGroupSummaryList} from './operation-group-summary-list';
import {OperationGroupSummaryListMapper} from '../../services/monitoring';

/**
 * Model of the summary of operation statuses.
 *
 * Holds the status of the entire operation list and a list of individual operations.
 * Currently, these could be backup, sparql querying and cluster operations
 */
export class OperationStatusSummary extends Model<OperationStatusSummary> {
  status: OperationStatus;
  allRunningOperations: OperationList;

  constructor(operationStatusSummary: Partial<OperationStatusSummary>) {
    super();
    this.status = operationStatusSummary.status || OperationStatus.INFORMATION;
    this.allRunningOperations = MapperProvider.get(OperationListMapper).mapToModel(operationStatusSummary.allRunningOperations || []);
  }

  /**
   * Transforms the OperationStatusSummary data into a grouped summary format.
   * This function aggregates operations by their group, calculates total operations per group,
   * and determines the highest severity status for each group.
   *
   * @returns {OperationGroupSummaryList} A mapped list of operation group summaries with aggregated statistics
   */
  toOperationsGroupSummary(): OperationGroupSummaryList {
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

    const operationGroupArray = Array.from(groupToOperationSummary.values());
    return MapperProvider.get(OperationGroupSummaryListMapper).mapToModel(operationGroupArray);
  }
}
