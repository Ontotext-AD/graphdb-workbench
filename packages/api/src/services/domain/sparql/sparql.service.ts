import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {SparqlRestService} from './sparql-rest.service';
import {mapSavedQueryListResponseToModel} from './mappers/saved-query-list.mapper';
import {SavedQueryList} from '../../../models/sparql';

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
}
