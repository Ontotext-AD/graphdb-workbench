import {PluginDefinitionList, PluginsManifest, PluginsManifestResponse} from '../../../models/plugins';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Maps the raw data to an instance of the {@link PluginsManifest} model.
 */
export const mapPluginsManifestResponseToModel: MapperFn<PluginsManifestResponse, PluginsManifest> = (data: PluginsManifestResponse) => {
  const pluginDefinitions = new PluginDefinitionList(data.plugins);
  return new PluginsManifest(pluginDefinitions);
};
