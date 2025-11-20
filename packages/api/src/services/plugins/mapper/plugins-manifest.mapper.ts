import {Mapper} from '../../../providers/mapper/mapper';
import {
  PluginDefinition,
  PluginDefinitionList,
  PluginsManifest,
  PluginsManifestResponse
} from '../../../models/plugins';
import {toObject, ensureArray} from '../../../providers/mapper/guards';

export class PluginsManifestMapper extends Mapper<PluginsManifest> {

  /**
   * Maps the raw data to an instance of the {@link PluginsManifest} model.
   *
   * @param {unknown} data - The raw data to be transformed into a model.
   * @returns {PluginsManifest} - A new instance of the {@link PluginsManifest} model
   */
  mapToModel(data: unknown): PluginsManifest {
    if (data instanceof PluginsManifest) {
      return data;
    }

    const src = toObject<PluginsManifestResponse>(data);
    const plugins = ensureArray<PluginDefinition>(src.plugins);

    const pluginDefinitions = new PluginDefinitionList(plugins);
    return new PluginsManifest(pluginDefinitions);
  }
}
