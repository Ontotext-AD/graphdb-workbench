import {Plugin} from '../../models/plugins';
import {ExtensionPoint} from '../../models/plugins';
import {OrderedExtensionPoint} from '../../models/plugins/extension-points/ordered/ordered-extension-point';
import {OrderedPlugin} from '../../models/plugins/plugins/ordered/ordered-plugin';
import {ExtensionPointAlreadyRegisteredError} from './extension-point-already-registered-error';
import {ExtensionPointNotFoundError} from './extension-point-not-found-error';
import {DuplicatePluginOrderError} from './duplicate-plugin-order-error';

/**
 * Manages plugin registration and retrieval for all extension points in the application.
 */
export class PluginRegistry {

  /**
   * Stores all registered extension points, keyed by their names.
   */
  private readonly extensionPoints: Record<string, ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>> = {};

  /**
   * Creates a new instance of the PluginRegistry with the provided extension points.
   *
   * @param {Record<string, ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>>} extensionPoints
   *   A mapping of extension point names to their corresponding extension point instances.
   *   Each entry defines a specific extension point (e.g., main menu, routes, themes)
   *   that can register and manage plugins.
   */
  constructor(extensionPoints: Record<string, ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>> = {}) {
    this.extensionPoints = extensionPoints;
  }

  /**
   * Registers a new extension point in the plugin registry.
   *
   * Throws an error if an extension point with the same name is already registered, to prevent accidental overwrites.
   *
   * @param {ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>} extensionPoint
   *   The extension point instance to register. The `name` property of the extension point is used as the unique key in the registry.
   *
   * @throws {Error} If an extension point with the same name already exists.
   */
  registerExtensionPoint(extensionPoint: ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>) {
    if (this.extensionPoints[extensionPoint.name]) {
      throw new ExtensionPointAlreadyRegisteredError(extensionPoint);
    }
    this.extensionPoints[extensionPoint.name] = extensionPoint;
  }

  /**
   * Adds a plugin or multiple plugins to the registry for a specific extension point.
   * If a plugin has a unique ID and a plugin with the same ID already exists, the new plugin will replace the old one.
   *
   * @param extensionPointName - The name of the extension point to which the plugin(s) should be added.
   * @param plugin - The plugin or array of plugins to add to the registry.
   */
  add(extensionPointName: string, plugin: Plugin | Plugin[] | undefined): void {
    if (!plugin) {
      return;
    }

    const extensionPoint = this.getExtensionPoint(extensionPointName);
    const plugins = Array.isArray(plugin) ? plugin : [plugin];

    plugins.forEach((p) => this.registerPlugin(extensionPoint, p));
  }

  /**
   * Retrieves all plugins registered for a given extension point.
   *
   * @param extensionPointName - The extension point name for which to retrieve plugins.
   * @returns An array of plugins registered for the specified extension point.
   */
  get<T extends Plugin>(extensionPointName: string): T[] {
    const extensionPoint = this.getExtensionPoint(extensionPointName);
    return extensionPoint.getPlugins() as T[];
  }

  /**
   * Finds a plugin in a specific extension point that matches a given predicate.
   *
   * @param extensionPointName - The name of the extension point to search.
   * @param predicate - A function to test each plugin.
   * @returns The first plugin matching the predicate, or undefined if none is found.
   */
  findPlugin<T extends Plugin>(extensionPointName: string, predicate: (item: T) => boolean): T | undefined {
    return this.get<T>(extensionPointName).find(predicate) as T | undefined;
  }

  /**
   * Returns all extension points along with their registered plugins.
   *
   * @returns {Record<string, ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>>}
   *   A mapping of extension point names to their corresponding extension point instances.
   */
  getExtensionPoints(): Record<string, ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>> {
    return this.extensionPoints;
  }

  /**
   * Removes all plugins registered under a specific extension point.
   *
   * @param {string} extensionPointName - The name of the extension point to clear.
   */
  clear(extensionPointName: string): void {
    this.getExtensionPoint(extensionPointName).removeAllPlugins();
  }

  /**
   * Removes all plugins from all extension points in the registry.
   */
  clearAll(): void {
    Object.values(this.extensionPoints).forEach((ep) => ep.removeAllPlugins());
  }

  /**
   * Retrieves an extension point by its name.
   *
   * @param extensionPointName - The name of the extension point to retrieve.
   * @returns The requested extension point.
   * @throws {Error} If the extension point with the given name does not exist.
   */
  private getExtensionPoint(extensionPointName: string): ExtensionPoint<Plugin | OrderedPlugin> {
    const extensionPoint = this.extensionPoints[extensionPointName];
    if (!extensionPoint) {
      throw new ExtensionPointNotFoundError(extensionPointName);
    }
    return extensionPoint;
  }

  /**
   * Registers the given plugin with the specified extension point.
   *
   * Disabled plugins are ignored. If the extension point is configured with a unique ID,
   * any existing plugin with the same ID will be removed before registering the new plugin.
   *
   * For ordered extension points, plugins are processed according to their `order` and `priority`.
   *
   * @param {ExtensionPoint<Plugin>} extensionPoint - The extension point where the plugin will be registered.
   * @param {Plugin} plugin - The plugin to register.
   */
  private registerPlugin(extensionPoint: ExtensionPoint<Plugin>, plugin: Plugin) {
    if (plugin.disabled) {
      return;
    }

    // Remove any existing plugin with the same unique ID before adding.
    extensionPoint.removePluginByFieldIdName(plugin);

    if (extensionPoint instanceof OrderedExtensionPoint) {
      this.processOrderedPlugin(plugin as OrderedPlugin, extensionPoint as OrderedExtensionPoint);
    } else {
      extensionPoint.addPlugin(plugin);
    }
  }

  /**
   * Handles registration and sorting of ordered plugins.
   * Ensures that plugins with the same order but lower priority are replaced.
   *
   * @param plugin - The ordered plugin to register.
   * @param extensionPoint - The extension point for ordered plugins.
   * @throws {Error} If a plugin with the same order and priority already exists.
   */
  private processOrderedPlugin(plugin: OrderedPlugin, extensionPoint: ExtensionPoint<OrderedPlugin>) {
    const sameOrderPlugin = extensionPoint.getPlugins().find((registeredPlugin) => registeredPlugin.order === plugin.order);

    if (sameOrderPlugin) {
      if (sameOrderPlugin.priority === plugin.priority) {
        throw new DuplicatePluginOrderError(extensionPoint, plugin.order, plugin.priority);
      }
      if (plugin.priority > sameOrderPlugin.priority) {
        extensionPoint.removePlugin(sameOrderPlugin);
        extensionPoint.addPlugin(plugin);
        extensionPoint.sort((a: OrderedPlugin, b: OrderedPlugin) => a.order - b.order);
      }
      return;
    }

    extensionPoint.addPlugin(plugin);
    extensionPoint.sort((a: OrderedPlugin, b: OrderedPlugin) => a.order - b.order);
  }
}
