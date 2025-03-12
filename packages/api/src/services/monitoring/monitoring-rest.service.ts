import {OperationStatusSummary} from '../../models/monitoring/operation-status-summary';
import {HttpService} from '../http/http.service';

/**
 * Service for interacting with the GraphDB monitoring REST API endpoints.
 */
export class MonitoringRestService extends HttpService {
  private readonly MONITORING_ENDPOINT = 'rest/monitor';

  /**
   * Retrieves the status summary of operations for a specific repository.
   *
   * @param repositoryId - The unique identifier of the repository for which to fetch operations.
   * @returns A Promise that resolves to an OperationStatusSummary containing information about the repository operations.
   */
  getOperations(repositoryId: string): Promise<OperationStatusSummary> {
    return this.get<OperationStatusSummary>(`${this.MONITORING_ENDPOINT}/repository/${repositoryId}/operations`);
  }
}
