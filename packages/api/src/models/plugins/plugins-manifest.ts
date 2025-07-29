import {Model} from '../common';
import {PluginDefinitionList} from './plugin-definition-list';

export class PluginsManifest extends Model<PluginsManifest> {
  private readonly _pluginDefinitions: PluginDefinitionList;

  constructor(plugins: PluginDefinitionList) {
    super();
    this._pluginDefinitions = plugins;
  }

  getPluginDefinitions(): PluginDefinitionList {
    return this._pluginDefinitions;
  }
}
