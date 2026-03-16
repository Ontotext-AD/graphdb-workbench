import {HttpService} from '../../http/http.service';
import {NamespacesResponse} from './response/namespaces-response';

/**
 * Service for interacting with the external RDF4J REST API.
 * This service is specifically designed to handle RDF4J-related operations.
 */
export class Rdf4jRestService extends HttpService {
  private readonly REPOSITORIES_ENDPOINT = 'repositories';

  /**
   * Returns the endpoint URL for getting all statements from the specified repository.
   * @param repositoryId - The ID of the repository for which to get the statements endpoint.
   * @returns The endpoint URL for getting all statements from the specified repository.
   */
  getStatementsEndpoint(repositoryId: string): string {
    return `${this.REPOSITORIES_ENDPOINT}/${repositoryId}/statements`;
  }

  /**
   * Returns the endpoint URL for executing SPARQL queries against the specified repository.
   * @param repositoryId - The ID of the repository for which to get the SPARQL endpoint.
   * @returns The endpoint URL for executing SPARQL queries against the specified repository.
   */
  getSparqlEndpoint(repositoryId: string): string {
    return `${this.REPOSITORIES_ENDPOINT}/${repositoryId}`;
  }

  /**
   * Retrieves namespaces for the specified repository.
   *
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to a NamespacesResponse object containing namespace mappings.
   */
  getNamespaces(repositoryId: string): Promise<NamespacesResponse> {
    return this.get(`${this.REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces`);
  }
}
