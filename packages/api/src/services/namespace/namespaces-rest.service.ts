import {HttpService} from '../http/http.service';
import {NamespacesResponse} from '../../models/repositories/namespace/api/namespaces-response';

/**
 * Service for interacting with the RDF4J repository REST API.
 */
export class NamespacesRestService extends HttpService {
  private readonly REPOSITORIES_ENDPOINT = 'repositories';

  /**
   * Retrieves namespace information for a specific repository.
   *
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to a NamespacesResponse object containing namespace mappings.
   */
  getNamespaces(repositoryId: string): Promise<NamespacesResponse> {
    return this.get(`${this.REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces`);
  }
}
