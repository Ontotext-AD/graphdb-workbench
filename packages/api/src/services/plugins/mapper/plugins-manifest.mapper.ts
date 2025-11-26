import {Mapper} from '../../../providers/mapper/mapper';
import {PluginsManifestResponse, PluginDefinitionList, PluginsManifest} from '../../../models/plugins';

export class PluginsManifestMapper extends Mapper<PluginsManifest> {

  /**
   * Maps the raw data to an instance of the {@link PluginsManifest} model.
   *
   * @param {PluginsManifestResponse} data - The raw data to be transformed into a model.
   * @returns {PluginsManifest} - A new instance of the {@link PluginsManifest} model
   */
  mapToModel(data: PluginsManifestResponse): PluginsManifest {
    const pluginDefinitions = new PluginDefinitionList(data.plugins);
    return new PluginsManifest(pluginDefinitions);
  }
}
