import {Model} from '../common';
import {OperationStatus} from './operation-status';
import {OperationType} from './operation-type';
import {OperationGroup} from './operation-group';
import {OperationResponse} from './operation-status-summary-response';

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

  constructor(dto: OperationResponse) {
    super();
    const value = dto.value ?? '';
    this.status = dto.status;
    this.type = dto.type;
    this.value = value;
    this.id = dto.id ?? `${this.status}-${this.type}-${value}`;
    this.group = (dto.group as OperationGroup) ?? OPERATION_TYPE_TO_GROUP[this.type];
    this.href = dto.href ?? OPERATION_TYPE_TO_HREF[this.type];
    this.count = this.computeCount(value);
    this.labelKey = this.computeLabelKey(value);
  }

  private computeCount(value: string) {
    if (!OPERATIONS_WITH_COUNT.includes(this.type)) {
      return 0;
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private computeLabelKey(value: string) {
    return OPERATIONS_WITH_COUNT.includes(this.type) ? this.type : value;
  }
}
