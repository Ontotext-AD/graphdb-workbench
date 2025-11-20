import {OperationStatus} from './operation-status';
import {OperationType} from './operation-type';

/**
 * REST DTO for a single operation item.
 */
export interface OperationResponse {
  type: OperationType;
  status: OperationStatus;
  value?: string;
  id?: string;
  href?: string;
  group?: string;
  count?: number;
}

/**
 * REST DTO for the operations status summary.
 */
export interface OperationStatusSummaryResponse {
  status: OperationStatus;
  allRunningOperations?: OperationResponse[];
}
