import {MapperFn} from '../../../../providers';
import {GraphExploreLinkResponse} from '../response/graph-explore-response';
import {GraphExploreLink} from '../../../../models/graph-explore';

/**
 * Maps the {@link GraphExploreLinkResponse[]} server data to a list of {@link GraphExploreLink} models.
 *
 * The response's `links[].predicates` are already the full predicate IRIs, so they are carried
 * through unchanged.
 *
 * @param data - The server response containing the graph links.
 * @returns A list of {@link GraphExploreLink} instances.
 */
export const mapGraphExploreResponseToLinks: MapperFn<GraphExploreLinkResponse[], GraphExploreLink[]> = (data: GraphExploreLinkResponse[]) => {
  return data.map((link) => new GraphExploreLink({
    source: link.source,
    target: link.target,
    predicates: link.predicates,
    rawPredicates: link.rawPredicates,
  }));
};
