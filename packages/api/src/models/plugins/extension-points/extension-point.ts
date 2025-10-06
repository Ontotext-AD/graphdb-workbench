import {Plugin} from '../plugins/plugin';
import {ObjectUtil} from '../../../services/utils';
import {PluginList} from '../plugins/unordered/plugin-list';

/**
 * Abstract base class representing an extension point that can hold plugins of type T.
 * Provides methods to add, remove, sort, and retrieve plugins.
 *
 * @template T - Type of plugin this extension point holds (must extend Plugin)
 */
export abstract class ExtensionPoint<T extends Plugin> {
  /**
   * Unique name of the extension point
   */
  abstract name: string;

  /**
   * Optional field used to identify plugins uniquely within this extension point
   */
  fieldIdName?: string;

  /**
   * List of plugins registered to this extension point
   */
  plugins: PluginList<T> = new PluginList<T>();

  /**
   * Removes a plugin based on the value of its `fieldIdName` property.
   * Only works if `fieldIdName` is defined.
   *
   * @param plugin - Plugin to remove
   */
  removePluginByFieldIdName(plugin: Plugin) {
    const fieldIdName = this.fieldIdName;
    if (!ObjectUtil.isDefined(fieldIdName)) {
      return;
    }

    const existingPlugin = this.plugins.find(item => item[fieldIdName] === plugin[fieldIdName]);
    if (existingPlugin) {
      this.plugins.remove(existingPlugin);
    }
  }

  /**
   * Adds a plugin to this extension point.
   *
   * @param plugin - Plugin instance to add
   */
  addPlugin(plugin: T) {
    this.plugins.addItems([plugin]);
  }

  /**
   * Retrieves all plugins registered to this extension point.
   *
   * @returns Array of plugins of type T
   */
  getPlugins(): T[] {
    return this.plugins.getItems();
  }

  /**
   * Removes a specific plugin instance from this extension point.
   *
   * @param plugin - Plugin instance to remove
   */
  removePlugin(plugin: T) {
    this.plugins.remove(plugin);
  }

  /**
   * Sorts the plugins using the provided comparator function.
   *
   * @param comparator - Function used to compare two plugins of type T
   */
  sort(comparator: (a: T, b: T) => number) {
    this.plugins.sort(comparator);
  }
}
