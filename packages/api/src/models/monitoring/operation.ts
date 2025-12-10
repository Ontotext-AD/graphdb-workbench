import {Model} from '../common';
import {OperationStatus} from './operation-status';
import {OperationType} from './operation-type';
import {OperationGroup} from './operation-group';
import {OperationInit} from './operation-init';

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

  constructor(operation: OperationInit) {
    super();
    const value = operation?.value ?? '';
    this.status = operation?.status;
    this.type = operation.type;
    this.value = value;
    this.id = operation?.id ?? `${this.status}-${this.type}-${value}`;
    this.group = (operation?.group as OperationGroup) ?? OPERATION_TYPE_TO_GROUP[this.type];
    this.href = operation?.href ?? OPERATION_TYPE_TO_HREF[this.type];
    this.count = this.getCount(value);
    this.labelKey = this.getLabelKey(value);
  }

  private getCount(value: string): number {
    if (!OPERATIONS_WITH_COUNT.includes(this.type)) {
      return 0;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private getLabelKey(value: string): string {
    return OPERATIONS_WITH_COUNT.includes(this.type)
      ? this.type
      : value;
  }
}
