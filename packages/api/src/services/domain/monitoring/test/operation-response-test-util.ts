import {OperationResponse, OperationStatusSummaryResponse} from '../response/operation-status-summary-response';

const allRunningOperations: OperationResponse[] = [
  {
    type: 'clusterHealth',
    status: 'WARNING',
    value: 'UNAVAILABLE_NODES',
  },
  {
    type: 'backupAndRestore',
    status: 'INFORMATION',
    value: 'BACKUP_IN_PROGRESS',
  }
];

export const createOperationStatusSummaryResponse = (): OperationStatusSummaryResponse => {
  return {
    status: 'WARNING',
    allRunningOperations,
  };
};
