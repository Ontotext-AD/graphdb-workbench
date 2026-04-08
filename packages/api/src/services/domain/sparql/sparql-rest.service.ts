import {HttpService} from '../../http/http.service';
import {SavedQueryListResponse} from './response/saved-query-response';
import {SaveQueryRequest} from './request/save-query-request';

/**
 * Service for interacting with SPARQL-related REST endpoints.
 */
export class SparqlRestService extends HttpService {
  static readonly SPARQL_ENDPOINT = 'rest/sparql';
  static readonly SAVED_QUERIES_ENDPOINT = `${SparqlRestService.SPARQL_ENDPOINT}/saved-queries`;

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
    return this.get(SparqlRestService.SAVED_QUERIES_ENDPOINT, {params});
  }

  /**
   * Retrieves saved queries list from the server.
   * @returns A promise that resolves to an array of {@link SavedQueryListResponse} containing the saved queries.
   */
  async getSavedQueries(): Promise<SavedQueryListResponse> {
    return this.get(SparqlRestService.SAVED_QUERIES_ENDPOINT);
  }

  /**
   * Saves a sparql query.
   * @param payload - The save query request payload.
   * @returns Promise that resolves when the query is successfully saved, or rejects with an error if the operation fails.
   */
  saveQuery(payload: SaveQueryRequest): Promise<void> {
    return this.post(SparqlRestService.SAVED_QUERIES_ENDPOINT, {body: payload});
  }

  /**
   * Updates existing saved sparql query.
   * @param oldQueryName The existing saved query name which should be updated.
   * @param payload The update query request payload.
   * @returns Promise that resolves when the query is successfully updated, or rejects with an error if the operation fails.
   */
  updateQuery(oldQueryName: string, payload: SaveQueryRequest): Promise<void> {
    return this.put(SparqlRestService.SAVED_QUERIES_ENDPOINT, {
      params: {
        oldQueryName: oldQueryName
      },
      body: payload
    });
  }

  /**
   * Deletes a saved query by its name.
   * @param queryName The saved query name to be deleted.
   * @returns Promise that resolves when the query is successfully deleted, or rejects with an error if the operation fails.
   */
  deleteQuery(queryName: string): Promise<void> {
    return this.delete(SparqlRestService.SAVED_QUERIES_ENDPOINT, {
      params: {
        name: queryName
      }
    });
  }
}
