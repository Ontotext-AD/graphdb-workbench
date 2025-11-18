import {Mapper} from '../../../providers/mapper/mapper';
import {OperationStatusSummary} from '../../../models/monitoring/operation-status-summary';
import {OperationListMapper} from './operation-list.mapper';
import {OperationStatusSummaryResponse} from '../../../models/monitoring/operation-status-summary-response';

/**
 * Mapper class for converting OperationStatusSummaryResponse to OperationStatusSummary.
 */
export class OperationSummaryMapper extends Mapper<OperationStatusSummary> {
  /**
   * Maps the OperationStatusSummary data from the backend to an OperationStatusSummary model.
   * @param {OperationStatusSummaryResponse} data - The response data to be mapped.
   * @returns {OperationStatusSummary} A new instance of OperationStatusSummary created from the input data.
   */
  mapToModel(data: OperationStatusSummaryResponse): OperationStatusSummary {
    return new OperationStatusSummary({
      status: data.status,
      allRunningOperations: new OperationListMapper().mapToModel(data.allRunningOperations ?? [])
    } as OperationStatusSummary);
  }
}
