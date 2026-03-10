import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {mapNamespaceResponseToModel} from './mappers/namespace-map.mapper';
import {NamespaceMap} from '../../../models/namespace';
import {Rdf4jRestService} from '../rdf4j';

/**
 * Service for interacting with RDF4J repositories.
 */
export class NamespacesService implements Service {
  private readonly rdf4jRestService = service(Rdf4jRestService);

  /**
   * Retrieves all prefixes, mapped to their respective URIs.
   *
   * @param repositoryId The unique identifier of the repository for which to retrieve namespaces.
   * @returns A promise that resolves to a NamespaceMap containing prefixes mapped to their URIs.
   */
  async getNamespaces(repositoryId: string): Promise<NamespaceMap> {
    const response = await this.rdf4jRestService.getNamespaces(repositoryId);
    return mapNamespaceResponseToModel(response);
  }
}
