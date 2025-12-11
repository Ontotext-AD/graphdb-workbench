import {Model} from '../common';
import {OperationStatus} from './operation-status';
import {OperationType} from './operation-type';
import {OperationGroup} from './operation-group';

/** Not all operations have counts as values */
const OPERATIONS_WITH_COUNT = [OperationType.QUERIES, OperationType.UPDATES, OperationType.IMPORT];

const OPERATION_TYPE_TO_HREF = {
  [OperationType.UPDATES]: 'monitor/queries',
  [OperationType.QUERIES]: 'monitor/queries',
  [OperationType.BACKUP_AND_RESTORE]: 'monitor/backup-and-restore',
  [OperationType.IMPORT]: 'import',
  [OperationType.CLUSTER_HEALTH]: 'cluster'
};

const OPERATION_TYPE_TO_GROUP = {
  [OperationType.QUERIES]: OperationGroup.QUERY,
  [OperationType.UPDATES]: OperationGroup.QUERY,
  [OperationType.BACKUP_AND_RESTORE]: OperationGroup.BACKUP,
  [OperationType.IMPORT]: OperationGroup.IMPORT,
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

  constructor(operation: {
    value: string;
    status: OperationStatus;
    type: OperationType;
  }) {
    super();
    this.value = operation.value;
    this.status = operation.status;
    this.type = operation.type;
    this.id = `${operation.status}-${operation.type}-${operation.value}`;
    this.count = this.getCount(this.type, this.value);
    this.group = OPERATION_TYPE_TO_GROUP[this.type];
    this.href = OPERATION_TYPE_TO_HREF[this.type];
    this.labelKey = this.getLabelKey(this.type, this.value);
  }

  private getCount(type: OperationType, value: string) {
    return OPERATIONS_WITH_COUNT.includes(type) ? parseInt(value, 10) : 0;
  }

  private getLabelKey(type: OperationType, value: string) {
    return OPERATIONS_WITH_COUNT.includes(type) ? type : value;
  }
}
