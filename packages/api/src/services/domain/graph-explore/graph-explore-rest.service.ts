import {HttpService} from '../../http/http.service';
import {GraphExploreRequest} from './request/graph-explore-request';
import {GraphExploreLinkResponse} from './response/graph-explore-response';

/**
 * Service for interacting with the graph-explore REST API.
 */
export class GraphExploreRestService extends HttpService {

  static readonly EXPLORE_GRAPH_ENDPOINT = 'rest/explore-graph';

  /**
   * Computes the graph for the given SPARQL query.
   *
   * @param request - The graph-explore request payload.
   * @returns A Promise that resolves to a {@link GraphExploreLinkResponse[]} containing the graph links.
   */
  loadGraph(request: GraphExploreRequest): Promise<GraphExploreLinkResponse[]> {
    return this.post(`${GraphExploreRestService.EXPLORE_GRAPH_ENDPOINT}/graph`, {
      body: request
    });
  }
}
