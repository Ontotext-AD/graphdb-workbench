import {Service} from '../../providers/service/service';
import {OperationStatusSummary} from '../../models/monitoring/operation-status-summary';
import {ServiceProvider} from '../../providers';
import {MonitoringRestService} from './monitoring-rest.service';
import {mapOperationSummaryResponseToModel} from './mapper/operation-summary-mapper';

/**
 * Service class for handling operations-related functionality.
 */
export class MonitoringService implements Service {
  /**
   * Retrieves the status summary of operations.
   *
   * @returns {Promise<OperationStatusSummary>} A Promise that resolves to an OperationStatusSummary object,
   *          representing the current status of operations.
   */
  getOperations(repositoryId: string): Promise<OperationStatusSummary> {
    return ServiceProvider.get(MonitoringRestService).getOperations(repositoryId)
      .then((operations) => mapOperationSummaryResponseToModel(operations));
  }
}
