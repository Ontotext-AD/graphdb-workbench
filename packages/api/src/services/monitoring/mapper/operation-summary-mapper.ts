import {Mapper} from '../../../providers/mapper/mapper';
import {OperationStatusSummary} from '../../../models/monitoring/operation-status-summary';
import {OperationListMapper} from './operation-list.mapper';
import {
  OperationResponse,
  OperationStatusSummaryResponse
} from '../../../models/monitoring';

/**
 * Mapper class for converting OperationStatusSummaryResponse to OperationStatusSummary.
 */
export class OperationSummaryMapper extends Mapper<OperationStatusSummary> {
  private readonly operationListMapper = new OperationListMapper();

  /**
   * Maps the OperationStatusSummary data from the backend to an OperationStatusSummary model.
   * @param {OperationStatusSummaryResponse | OperationStatusSummary} data - The response data to be mapped.
   * @returns {OperationStatusSummary} A new instance of OperationStatusSummary created from the input data.
   */
  mapToModel(data: OperationStatusSummaryResponse | OperationStatusSummary): OperationStatusSummary {
    if (data instanceof OperationStatusSummary) {
      return data;
    }

    const allRunningResponses: OperationResponse[] = data.allRunningOperations ?? [];
    const allRunningOperations = this.operationListMapper.mapToModel(allRunningResponses);

    return new OperationStatusSummary({
      status: data.status,
      allRunningOperations,
    });
  }
}
