import {HttpService} from '../../http/http.service';
import {SavedQueryListResponse} from './response/saved-query-response';

/**
 * Service for interacting with SPARQL-related REST endpoints.
 */
export class SparqlRestService extends HttpService {
  static readonly SPARQL_ENDPOINT = 'rest/sparql';

  /**
   * Retrieves a saved SPARQL query by its name and owner.
   * @param queryName - The name of the saved query to retrieve.
   * @param owner - The owner of the saved query. Optional.
   * @returns A promise that resolves to a {@link SavedQueryListResponse} containing the saved query or queries.
   */
  getSavedQuery(queryName: string, owner: string): Promise<SavedQueryListResponse> {
    const params: Record<string, string> = {
      name: queryName,
    };
    if (owner) {
      params['owner'] = owner;
    }
    return this.get(`${SparqlRestService.SPARQL_ENDPOINT}/saved-queries`, {params});
  }

  /**
   * Retrieves saved queries list from the server.
   * @returns A promise that resolves to an array of {@link SavedQueryListResponse} containing the saved queries.
   */
  async getSavedQueries(): Promise<SavedQueryListResponse> {
    return this.get(`${SparqlRestService.SPARQL_ENDPOINT}/saved-queries`);
  }
}
