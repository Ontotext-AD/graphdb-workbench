import {PluginDefinition, PluginDefinitionList, PluginsManifest} from '../../../models/plugins';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {PluginsManifestResponse} from '../response/plugins-manifest-response';

/**
 * Maps the raw data to an instance of the {@link PluginsManifest} model.
 */
export const mapPluginsManifestResponseToModel: MapperFn<PluginsManifestResponse, PluginsManifest> = (data: PluginsManifestResponse) => {
  const pluginDefinitions = data.plugins.map((plugin) => {
    return new PluginDefinition(plugin.entry, plugin.name);
  });
  return new PluginsManifest(new PluginDefinitionList(pluginDefinitions));
};
