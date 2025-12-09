import {OperationGroupSummaryList} from '../../../models/monitoring/operation-group-summary-list';
import {OperationGroupSummary} from '../../../models/monitoring';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting an array of OperationGroupSummary objects to an OperationGroupSummaryList model.
 */
export const mapOperationGroupSummaryListResponseToModel: MapperFn<OperationGroupSummary[], OperationGroupSummaryList> = (data) => {
  return new OperationGroupSummaryList(data);
};

