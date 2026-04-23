import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {SparqlRestService} from './sparql-rest.service';
import {mapSavedQueryListResponseToModel} from './mappers/saved-query-list.mapper';
import {SavedQueryList} from '../../../models/sparql';
import {SaveQueryRequest} from './request/save-query-request';

/**
 * Service for handling SPARQL-related operations.
 */
export class SparqlService implements Service {
  private readonly sparqlRestService = service(SparqlRestService);

  /**
   * Retrieves a saved SPARQL query by its name and owner.
   * @param queryName - The name of the saved query to retrieve.
   * @param owner - The owner of the saved query. Optional.
   * @returns A promise that resolves to the saved query model.
   */
  async getSavedQuery(queryName: string, owner: string): Promise<SavedQueryList> {
    const response = await this.sparqlRestService.getSavedQuery(queryName, owner);
    return mapSavedQueryListResponseToModel(response);
  }

  /**
   * Retrieves all saved queries from the server.
   * @returns A promise that resolves to the list with saved queries.
   */
  async getSavedQueries(): Promise<SavedQueryList> {
    const response = await this.sparqlRestService.getSavedQueries();
    return mapSavedQueryListResponseToModel(response);
  }

  /**
   * Saves a sparql query.
   * @param payload The save query request payload containing the query data to be saved.
   * @returns A promise that resolves when the query is successfully saved, or rejects with an error if the operation fails.
   */
  saveQuery(payload: SaveQueryRequest): Promise<void> {
    return this.sparqlRestService.saveQuery(payload);
  }

  /**
   * Updates existing saved sparql query.
   * @param oldQueryName The existing saved query name which should be updated.
   * @param payload The update query request payload.
   * @returns Promise that resolves when the query is successfully updated, or rejects with an error if the operation fails.
   */
  updateQuery(oldQueryName: string, payload: SaveQueryRequest): Promise<void> {
    return this.sparqlRestService.updateQuery(oldQueryName, payload);
  }

  /**
   * Deletes a saved query by its name.
   * @param queryName The name of the saved query to be deleted.
   * @returns Promise that resolves when the query is successfully deleted, or rejects with an error if the operation fails.
   */
  deleteQuery(queryName: string): Promise<void> {
    return this.sparqlRestService.deleteQuery(queryName);
  }
}
