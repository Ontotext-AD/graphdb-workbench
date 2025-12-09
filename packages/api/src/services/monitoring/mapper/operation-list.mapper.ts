import {OperationList} from '../../../models/monitoring/operation-list';
import {Operation} from '../../../models/monitoring/operation';
import {OperationType} from '../../../models/monitoring/operation-type';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

const OPERATION_TYPE_SORT_ORDER = {
  [OperationType.CLUSTER_HEALTH]: 0,
  [OperationType.BACKUP_AND_RESTORE]: 1,
  [OperationType.IMPORT]: 2,
  [OperationType.QUERIES]: 3,
  [OperationType.UPDATES]: 4
};

/**
 * Mapper class for converting an array of Operation objects to an OperationList model.
 */
export const mapOperationListResponseToModel: MapperFn<Operation[], OperationList> = (data) => {
  return new OperationList(
    data
      .map((operation) => new Operation(operation))
      .sort((a, b) => OPERATION_TYPE_SORT_ORDER[a.type] - OPERATION_TYPE_SORT_ORDER[b.type])
  );
};
