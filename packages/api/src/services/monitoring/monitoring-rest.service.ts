import {HttpService} from '../http/http.service';
import {OperationStatusSummaryResponse} from '../../models/monitoring/operation-status-summary-response';

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
  getOperations(repositoryId: string): Promise<OperationStatusSummaryResponse> {
    return this.get<OperationStatusSummaryResponse>(`${this.MONITORING_ENDPOINT}/repository/${repositoryId}/operations`);
  }
}
