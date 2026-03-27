import {Service} from '../../../providers/service/service';
import {OperationStatusSummary} from '../../../models/monitoring/operation-status-summary';
import {service} from '../../../providers';
import {MonitoringRestService} from './monitoring-rest.service';
import {mapOperationSummaryResponseToModel} from './mapper/operation-summary-mapper';

/**
 * Service class for handling operations-related functionality.
 */
export class MonitoringService implements Service {
  private readonly monitoringRestService = service(MonitoringRestService);

  /**
   * Retrieves the status summary of operations.
   *
   * @returns {Promise<OperationStatusSummary>} A Promise that resolves to an OperationStatusSummary object,
   *          representing the current status of operations.
   */
  async getOperations(repositoryId: string): Promise<OperationStatusSummary> {
    const operations = await this.monitoringRestService.getOperations(repositoryId);
    return mapOperationSummaryResponseToModel(operations);
  }

  /**
   * Deletes a specific query for a given repository.
   * @param queryId - The unique identifier of the query to be deleted.
   * @param repositoryId - The unique identifier of the repository from which to delete the query.
   * @returns A Promise that resolves when the query has been successfully deleted.
   */
  deleteQuery(queryId: string, repositoryId: string) {
    return this.monitoringRestService.deleteQuery(queryId, repositoryId);
  }
}
