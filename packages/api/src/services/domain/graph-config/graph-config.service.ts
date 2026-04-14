import {GraphConfigList} from '../../../models/graph-config';
import {GraphConfigRestService} from './graph-config-rest.service';
import {mapGraphConfigListResponseToModel} from './mappers/graph-config.mapper';
import {service} from '../../../providers';
import {Service} from '../../../providers/service/service';

/**
 * Service for interacting with graph configurations.
 */
export class GraphConfigService implements Service {
  private readonly graphConfigRestService = service(GraphConfigRestService);

  /**
   * Returns the graph configurations from the REST API.
   *
   * @returns A Promise that resolves to a GraphConfigList containing the graph configurations.
   */
  async getGraphConfigs(): Promise<GraphConfigList> {
    const response = await this.graphConfigRestService.getGraphConfigs();
    return mapGraphConfigListResponseToModel(response);
  }
}
