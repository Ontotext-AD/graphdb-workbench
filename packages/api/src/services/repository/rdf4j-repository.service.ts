import {Service} from '../../providers/service/service';
import {NamespaceMap} from '../../models/repositories';
import {NamespaceMapMapper} from './mappers/namespace-map.mapper';
import {Rdf4jRepositoryRestService} from './rdf4j-repository-rest.service';
import {MapperProvider, ServiceProvider} from '../../providers';

/**
 * Service for interacting with RDF4J repositories.
 */
export class Rdf4jRepositoryService implements Service {
  private namespaceMapper = MapperProvider.get(NamespaceMapMapper);
  private readonly rdf4jRepositoryRestService = ServiceProvider.get(Rdf4jRepositoryRestService);

  /**
   * Retrieves all prefixes, mapped to their respective URIs.
   *
   * @param repositoryId The unique identifier of the repository for which to retrieve namespaces.
   * @returns A promise that resolves to a NamespaceMap containing prefixes mapped to their URIs.
   */
  getNamespaces(repositoryId: string): Promise<NamespaceMap> {
    return this.rdf4jRepositoryRestService.getNamespaces(repositoryId)
      .then((response) => this.namespaceMapper.mapToModel(response));
  }
}
