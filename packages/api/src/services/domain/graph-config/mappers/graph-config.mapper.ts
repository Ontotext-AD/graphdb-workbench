import {MapperFn} from '../../../../providers';
import {GraphConfigListResponse, GraphConfigResponse} from '../response/graph-config-response';
import {
  GraphConfigList,
  StartMode,
  GraphConfig,
} from '../../../../models/graph-config';

/**
 * Maps server response data {@link GraphConfigListResponse} to a {@link GraphConfigList} model.
 *
 * Processes an array of graph configuration responses and converts each item into a {@link GraphConfig} instance.
 *
 * @param data - The server response containing an array of graph configurations.
 * @returns A {@link GraphConfigList} containing mapped graph configurations.
 */
export const mapGraphConfigListResponseToModel: MapperFn<GraphConfigListResponse, GraphConfigList> = (data: GraphConfigListResponse) => {
  if (!Array.isArray(data)) {
    return new GraphConfigList();
  }
  return new GraphConfigList(data.map(mapGraphConfigResponseToModel));
};

/**
 * Maps a single {@link GraphConfigResponse} object to a {@link GraphConfig} model.
 *
 * @param data - The graph configuration response from the server.
 * @returns A {@link GraphConfig} instance.
 */
export const mapGraphConfigResponseToModel: MapperFn<GraphConfigResponse, GraphConfig> = (data: GraphConfigResponse) => {
  return new GraphConfig({
    id: data.id,
    name: data.name,
    description: data.description,
    owner: data.owner,
    repositoryId: data.repositoryId,
    hint: data.hint,
    shared: data.shared ?? false,
    startMode: data.startMode ?? StartMode.SEARCH,
    startIRI: data.startIRI,
    startIRILabel: data.startIRILabel,
    startQueryIncludeInferred: data.startQueryIncludeInferred ?? true,
    startQuerySameAs: data.startQuerySameAs ?? true,
    startGraphQuery: data.startGraphQuery,
    expandQuery: data.expandQuery,
    predicateLabelQuery: data.predicateLabelQuery,
    resourcePropertiesQuery: data.resourcePropertiesQuery,
    resourceQuery: data.resourceQuery,
  });
};
