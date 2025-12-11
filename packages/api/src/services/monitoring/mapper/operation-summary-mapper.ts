import {OperationStatusSummary} from '../../../models/monitoring/operation-status-summary';
import {Operation, OperationList, OperationStatus, OperationType} from '../../../models/monitoring';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {OperationStatusSummaryResponse} from '../response/operation-status-summary-response';
import {toEnum} from '../../utils';

const OPERATION_TYPE_SORT_ORDER = {
  [OperationType.CLUSTER_HEALTH]: 0,
  [OperationType.BACKUP_AND_RESTORE]: 1,
  [OperationType.IMPORT]: 2,
  [OperationType.QUERIES]: 3,
  [OperationType.UPDATES]: 4
};

/**
 * Mapper for converting OperationStatusSummaryResponse to OperationStatusSummary.
 */
export const mapOperationSummaryResponseToModel: MapperFn<OperationStatusSummaryResponse, OperationStatusSummary> = (data) => {
  return new OperationStatusSummary({
    status: toEnum(OperationStatus, data.status),
    allRunningOperations: mapOperationListResponseToModel(
      data.allRunningOperations.map((operation) => new Operation({
        value: operation.value,
        status: toEnum(OperationStatus, operation.status),
        type: toEnum(OperationType, operation.type)
      }))
    )
  } as OperationStatusSummary);
};

/**
 * Mapper for converting an array of Operation objects to an OperationList model.
 */
function mapOperationListResponseToModel(data: Operation[]): OperationList {
  return new OperationList(
    data
      .sort((a, b) => OPERATION_TYPE_SORT_ORDER[a.type] - OPERATION_TYPE_SORT_ORDER[b.type])
  );
}
