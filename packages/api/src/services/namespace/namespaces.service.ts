import {Service} from '../../providers/service/service';
import {NamespacesRestService} from './namespaces-rest.service';
import {ServiceProvider} from '../../providers';
import {mapNamespaceResponseToModel} from './mappers/namespace-map.mapper';
import {NamespaceMap} from '../../models/namespace';

/**
 * Service for interacting with RDF4J repositories.
 */
export class NamespacesService implements Service {
  private readonly namespacesRestService = ServiceProvider.get(NamespacesRestService);

  /**
   * Retrieves all prefixes, mapped to their respective URIs.
   *
   * @param repositoryId The unique identifier of the repository for which to retrieve namespaces.
   * @returns A promise that resolves to a NamespaceMap containing prefixes mapped to their URIs.
   */
  getNamespaces(repositoryId: string): Promise<NamespaceMap> {
    return this.namespacesRestService.getNamespaces(repositoryId)
      .then((response) => mapNamespaceResponseToModel(response));
  }
}
