import {HttpService} from '../../http/http.service';
import {NamespacesResponse} from './response/namespaces-response';
import {SparqlResultsResponse} from '../../../models/sparql';
import {HttpResponse} from '../../../models/http';
import {SparqlRequestOptions} from './request/sparql-request-options';

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

  /**
   * Downloads sparql results as a file in given format provided by the accept header parameter.
   * @param repositoryId - The id of the repository.
   * @param data - The data to be sent in the request body, typically containing the SPARQL query and any additional
   * parameters.
   * @param acceptHeader - The value for the 'Accept' header indicating the desired format of the response
   * (e.g., 'application/sparql-results+json').
   * @param linkHeader - The value for the 'Link' header, which may contain additional information about the request or
   * response, such as pagination details or related resources.
   * @returns A Promise that resolves to the HTTP response containing the file data as a Blob, along with the
   * appropriate headers for file download. The response will include the file data and the filename extracted from the
   * 'Content-Disposition' header if available.
   * @throws An error if the HTTP request fails or if the response does not contain the expected file data.
   */
  downloadResultsAsFile(repositoryId: string, data: object, acceptHeader: string, linkHeader: string) {
    const properties = Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => `${property}=${encodeURIComponent(value)}`);
    const payloadString = properties.join('&');

    return this.post(`${this.REPOSITORIES_ENDPOINT}/${repositoryId}`, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Accept': acceptHeader,
        'Link': linkHeader
      },
      body: payloadString,
    });
  }

  /**
   * Retrieves the size of the specified repository.
   * @param repositoryId - The id of the repository.
   * @returns A Promise that resolves to the size of the repository as a number.
   * @throws An error if the HTTP request fails or if the response does not contain the expected size data.
   */
  getRepositorySize(repositoryId: string): Promise<number> {
    return this.get(`${this.REPOSITORIES_ENDPOINT}/${repositoryId}/size`);
  }

  /**
   * Executes a SPARQL SELECT query against the specified repository.
   * @param repositoryId - The ID of the repository to query.
   * @param query - The SPARQL SELECT query string.
   * @returns A promise resolving to the raw SPARQL SELECT results.
   */
  executeSparqlQuery(repositoryId: string, query: string): Promise<SparqlResultsResponse> {
    return this.post<SparqlResultsResponse>(`${this.REPOSITORIES_ENDPOINT}/${repositoryId}`, {
      body: new URLSearchParams({query}),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/sparql-results+json',
        'X-GraphDB-Local-Consistency': 'updating',
      }
    });
  }

  /**
   * Executes a SPARQL query against the specified repository and returns the full HTTP response
   * with the body left unparsed.
   *
   * Unlike {@link executeSparqlQuery}, the caller chooses the response format via the `accept`
   * option (e.g. `application/sparql-results+json` for SELECT/ASK or `text/turtle` for
   * CONSTRUCT/DESCRIBE) and reads the raw payload from {@link HttpResponse.originalResponse}.
   * This suits consumers that need the unparsed response, such as the Reactodia graph provider.
   *
   * @param repositoryId - The ID of the repository to query.
   * @param query - The SPARQL query string.
   * @param options - Request options; `accept` sets the desired response format.
   * @returns A promise resolving to the HTTP response.
   */
  executeSparqlRequest(repositoryId: string, query: string, options: SparqlRequestOptions = {}): Promise<HttpResponse<string>> {
    return this.post<string>(`${this.REPOSITORIES_ENDPOINT}/${repositoryId}`, {
      responseType: 'response',
      body: new URLSearchParams({query}),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': options.accept ?? 'application/sparql-results+json',
      }
    });
  }
}
