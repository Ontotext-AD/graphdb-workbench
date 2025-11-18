import {OperationGroup} from './operation-group';
import {OperationStatus} from './operation-status';

export interface OperationGroupSummaryResponse {
  group: OperationGroup;
  totalOperations: number;
  status: OperationStatus;
}
