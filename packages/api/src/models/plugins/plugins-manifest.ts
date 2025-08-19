import {Model} from '../common';
import {PluginDefinitionList} from './plugin-definition-list';

/**
 * PluginsManifest is a class that represents the manifest of plugins in the application.
 * It contains a list of plugin definitions and provides methods to access them.
 */
export class PluginsManifest extends Model<PluginsManifest> {
  private readonly _pluginDefinitions: PluginDefinitionList;

  constructor(plugins: PluginDefinitionList) {
    super();
    this._pluginDefinitions = plugins;
  }

  /**
   * Retrieves the list of plugin definitions in the manifest.
   * @return The PluginDefinitionList containing all plugin definitions.
   */
  getPluginDefinitions(): PluginDefinitionList {
    return this._pluginDefinitions;
  }
}
