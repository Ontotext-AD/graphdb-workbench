import {GraphExploreLink} from '../../../models/graph-explore';
import {GraphExploreRestService} from './graph-explore-rest.service';
import {GraphExploreContextService} from './graph-explore-context.service';
import {mapGraphExploreResponseToLinks} from './mappers/graph-explore.mapper';
import {service} from '../../../providers';
import {Service} from '../../../providers/service/service';

/**
 * Service for computing the graph of a SPARQL query for graph visualizations.
 */
export class GraphExploreService implements Service {
  private readonly graphExploreRestService = service(GraphExploreRestService);
  private readonly graphExploreContextService = service(GraphExploreContextService);

  /**
   * Computes the graph for the given SPARQL query and maps it to a list of {@link GraphExploreLink}.
   *
   * @param query - The SPARQL query to compute the graph for.
   * @param includeInferred - Whether to include inferred statements. Falls back to the default when omitted.
   * @param sameAs - Whether to enable owl:sameAs expansion. Falls back to the default when omitted.
   * @returns A Promise that resolves to the list of graph links.
   */
  async loadGraphForQuery(query: string, includeInferred?: boolean, sameAs?: boolean): Promise<GraphExploreLink[]> {
    const defaultSettings = this.graphExploreContextService.getSettings();
    const response = await this.graphExploreRestService.loadGraph({
      query,
      linksLimit: defaultSettings.linksLimit,
      languages: defaultSettings.languages,
      includeInferred: includeInferred ?? defaultSettings.includeInferred,
      sameAsState: sameAs ?? defaultSettings.sameAs,
    });
    return mapGraphExploreResponseToLinks(response);
  }
}
