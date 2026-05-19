import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {ConnectorsRestService} from './connectors-rest.service';
import {mapConnectorResponseToModel} from './mapper/connector-response-to-model.mapper';
import {mapConnectorBuildStatusResponseToModel} from './mapper/connector-build-status-response-to-model.mapper';
import {BeforeUpdateQueryResult, ConnectorBuildStatus} from '../../../models/connector';
import {Rdf4jRepositoryService} from '../rdf4j/rdf4j-repository.service';

/**
 * Service for managing connectors.
 */
export class ConnectorsService implements Service {
  private readonly connectorsRestService = service(ConnectorsRestService);
  private readonly rdf4jRepositoryService = service(Rdf4jRepositoryService);

  /**
   * Checks connector status.
   * @param query Optional query to check if the connector is enabled for. If not provided, it will check if the
   * connector is enabled in general.
   * @returns Promise resolving with the connector status.
   */
  async checkConnector(query?: string): Promise<BeforeUpdateQueryResult> {
    const response = await this.connectorsRestService.checkConnector(query);
    return mapConnectorResponseToModel(response);
  }

  /**
   * Retrieves the current build status of a connector.
   * @param iri - The IRI of the connector instance.
   * @param repositoryId - The ID of the repository to query.
   * @returns A promise resolving to the build status, or null if not available.
   */
  async getConnectorBuildStatus(iri: string, repositoryId: string): Promise<ConnectorBuildStatus | null> {
    const query = this.createConnectorStatusQuery(iri);
    const response = await this.rdf4jRepositoryService.executeSparqlQuery(repositoryId, query);
    return mapConnectorBuildStatusResponseToModel(response);
  }

  /**
   * Builds a SPARQL SELECT query that retrieves the build status of a connector instance.
   *
   * The connector status predicate IRI is derived by replacing the `/instance#<id>` suffix
   * of the instance IRI with `#connectorStatus`.
   */
  private createConnectorStatusQuery(iri: string): string {
    const statusIri = iri.replace(/\/instance#.+$/, '#connectorStatus');
    return `SELECT ?status {\n\t<${iri}> <${statusIri}> ?status\n}`;
  }
}
