import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {ConnectorsRestService} from './connectors-rest.service';
import {mapConnectorResponseToModel} from './mapper/connector-response-to-model.mapper';
import {BeforeUpdateQueryResult} from '../../../models/connector';

/**
 * Service for managing connectors.
 */
export class ConnectorsService implements Service {
  private readonly connectorsRestService = service(ConnectorsRestService);

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
}
