import {OperationGroup} from './operation-group';
import {OperationStatus} from './operation-status';

export interface OperationGroupSummaryDto {
  group: OperationGroup;
  totalOperations: number;
  status: OperationStatus;
}
