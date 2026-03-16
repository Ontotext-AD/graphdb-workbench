import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {Rdf4jRestService} from './rdf4j-rest.service';

/**
 * Service for interacting with RDF4J repositories.
 */
export class Rdf4jRepositoryService implements Service {
  private readonly rdf4jRestService = service(Rdf4jRestService);

  /**
   * Returns the endpoint URL for getting all statements from the specified repository.
   * @param repositoryId - The ID of the repository for which to get the statements endpoint.
   * @returns The endpoint URL for getting all statements from the specified repository.
   */
  getStatementsEndpoint(repositoryId: string): string {
    return this.rdf4jRestService.getStatementsEndpoint(repositoryId);
  }

  /**
   * Returns the endpoint URL for executing SPARQL queries against the specified repository.
   * @param repositoryId - The ID of the repository for which to get the SPARQL endpoint.
   * @returns The endpoint URL for executing SPARQL queries against the specified repository.
   */
  getSparqlEndpoint(repositoryId: string): string {
    return this.rdf4jRestService.getSparqlEndpoint(repositoryId);
  }
}
