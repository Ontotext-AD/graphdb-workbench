import {Model} from '../common';
import {OperationStatus} from './operation-status';
import {OperationType} from './operation-type';
import {OperationGroup} from './operation-group';

/** Not all operations have counts as values */
const OPERATIONS_WITH_COUNT = [OperationType.QUERIES, OperationType.UPDATES, OperationType.IMPORTS];

const OPERATION_TYPE_TO_HREF = {
  [OperationType.UPDATES]: 'monitor/queries',
  [OperationType.QUERIES]: 'monitor/queries',
  [OperationType.BACKUP_AND_RESTORE]: 'monitor/backup-and-restore',
  [OperationType.IMPORTS]: 'imports',
  [OperationType.CLUSTER_HEALTH]: 'cluster'
};

const OPERATION_TYPE_TO_GROUP = {
  [OperationType.QUERIES]: OperationGroup.QUERY,
  [OperationType.UPDATES]: OperationGroup.QUERY,
  [OperationType.BACKUP_AND_RESTORE]: OperationGroup.BACKUP,
  [OperationType.IMPORTS]: OperationGroup.IMPORT,
  [OperationType.CLUSTER_HEALTH]: OperationGroup.CLUSTER
};

/**
 * Represents an operation in the system.
 */
export class Operation extends Model<Operation> {
  value: string;
  status: OperationStatus;
  type: OperationType;

  // Internal properties
  id: string;
  count: number;
  group: OperationGroup;
  href: string;
  labelKey: string;

  constructor(operation: Operation) {
    super();
    this.id = `${operation.status}-${operation.type}-${operation.value}`;
    this.value = operation.value;
    this.status = operation.status;
    this.type = operation.type;
    this.count = this.getCount(operation);
    this.group = OPERATION_TYPE_TO_GROUP[operation.type];
    this.href = OPERATION_TYPE_TO_HREF[operation.type];
    this.labelKey = this.getLabelKey(operation);
  }

  private getCount(operation: Operation) {
    return OPERATIONS_WITH_COUNT.includes(operation.type) ? parseInt(operation.value, 10) : 0;
  }

  private getLabelKey(operation: Operation) {
    return OPERATIONS_WITH_COUNT.includes(operation.type) ? operation.type : operation.value;
  }
}
