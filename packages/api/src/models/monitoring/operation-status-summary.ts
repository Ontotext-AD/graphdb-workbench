import {Model} from '../common';
import {OperationStatus} from './operation-status';
import {OperationList} from './operation-list';
import {MapperProvider} from '../../providers';
import {OperationListMapper} from '../../services/monitoring/mapper/operation-list.mapper';

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
}
