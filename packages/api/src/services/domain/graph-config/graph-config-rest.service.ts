import {HttpService} from '../../http/http.service';
import {GraphConfigListResponse} from './response/graph-config-response';

/**
 * Service for interacting with the graph config REST API.
 */
export class GraphConfigRestService extends HttpService {

  static readonly EXPLORE_GRAPH_ENDPOINT = 'rest/explore-graph';

  /**
   * Returns the graph configurations from the REST API.
   *
   * @returns A Promise that resolves to a GraphConfigListResponse containing the graph configurations.
   */
  getGraphConfigs(): Promise<GraphConfigListResponse> {
    return this.get(`${GraphConfigRestService.EXPLORE_GRAPH_ENDPOINT}/config`);
  }
}
