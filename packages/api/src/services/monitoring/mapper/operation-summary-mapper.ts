import {OperationStatusSummary} from '../../../models/monitoring/operation-status-summary';
import {mapOperationListResponseToModel} from './operation-list.mapper';
import {Operation} from '../../../models/monitoring';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting OperationStatusSummaryResponse to OperationStatusSummary.
 */
export const mapOperationSummaryResponseToModel: MapperFn<OperationStatusSummary, OperationStatusSummary> = (data) => {
  return new OperationStatusSummary({
    status: data.status,
    allRunningOperations: mapOperationListResponseToModel(data.allRunningOperations as unknown as Operation[] || [])
  } as OperationStatusSummary);
};
