export enum OperationStatus {
  INFORMATION = 'INFORMATION',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export const STATUS_ORDER = {
  [OperationStatus.INFORMATION]: 0,
  [OperationStatus.WARNING]: 1,
  [OperationStatus.CRITICAL]: 2
};
