import {Mapper} from '../../../providers/mapper/mapper';
import {OperationStatusSummary} from '../../../models/monitoring/operation-status-summary';
import {OperationListMapper} from './operation-list.mapper';
import {
  OperationResponse,
  OperationStatusSummaryResponse
} from '../../../models/monitoring/operation-status-summary-response';
import {toObject, ensureArray} from '../../../providers/mapper/guards';

/**
 * Mapper class for converting OperationStatusSummaryResponse to OperationStatusSummary.
 */
export class OperationSummaryMapper extends Mapper<OperationStatusSummary> {
  private readonly operationListMapper = new OperationListMapper();

  /**
   * Maps the OperationStatusSummary data from the backend to an OperationStatusSummary model.
   * @param {OperationStatusSummaryResponse} data - The response data to be mapped.
   * @returns {OperationStatusSummary} A new instance of OperationStatusSummary created from the input data.
   */
  mapToModel(data: unknown): OperationStatusSummary {
    if (data instanceof OperationStatusSummary) {
      return data;
    }

    const src = toObject<OperationStatusSummaryResponse>(data);
    const allRunning = ensureArray<OperationResponse>(src.allRunningOperations);

    return new OperationStatusSummary({
      status: src.status,
      allRunningOperations: this.operationListMapper.mapToModel(allRunning)
    } as OperationStatusSummary);
  }
}
