import {OperationGroup} from './operation-group';
import {OperationStatus} from './operation-status';
import {OperationType} from './operation-type';

export interface OperationInit {
  type: OperationType;
  status: OperationStatus;
  value?: string;
  id?: string;
  href?: string;
  group?: OperationGroup;
}
