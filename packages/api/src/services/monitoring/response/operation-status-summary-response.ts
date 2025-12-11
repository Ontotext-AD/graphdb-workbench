export interface OperationStatusSummaryResponse {
  status: string;
  allRunningOperations: OperationResponse[];
}

export interface OperationResponse {
  status: string;
  type: string;
  value: string;
}
