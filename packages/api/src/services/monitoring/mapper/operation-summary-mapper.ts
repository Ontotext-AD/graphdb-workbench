import {Mapper} from '../../../providers/mapper/mapper';
import {OperationStatusSummary} from '../../../models/monitoring/operation-status-summary';

/**
 * Mapper class for converting OperationStatusSummaryResponse to OperationStatusSummary.
 */
export class OperationSummaryMapper extends Mapper<OperationStatusSummary> {
  /**
   * Maps the OperationStatusSummary data from the backend to an OperationStatusSummary model.
   * @param {OperationStatusSummary} data - The response data to be mapped.
   * @returns {OperationStatusSummary} A new instance of OperationStatusSummary created from the input data.
   */
  mapToModel(data: OperationStatusSummary): OperationStatusSummary {
    return new OperationStatusSummary(data);
  }
}
