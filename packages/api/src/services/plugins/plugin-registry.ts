import { Plugin } from '../../models/plugins/plugins/plugin';
import { ExtensionPoint, ExtensionPointName } from '../../models/plugins';
import { OrderedExtensionPoint } from '../../models/plugins/extension-points/ordered/ordered-extension-point';
import { OrderedPlugin } from '../../models/plugins/plugins/ordered/ordered-plugin';
import { MainMenuExtensionPoint } from '../../models/plugins/extension-points/unordered/main-menu-extension-point';
import { RouteExtensionPoint } from '../../models/plugins/extension-points/unordered/route-extension-point';
import { InteractiveGuideExtensionPoint } from '../../models/plugins/extension-points/unordered/interactive-guide-extension-point';
import { ThemesExtensionPoint } from '../../models/plugins/extension-points/unordered/themes-extension-point';

/**
 * Manages plugin registration and retrieval for all extension points in the application.
 */
export class PluginRegistry {

  /**
   * Stores all registered extension points, keyed by their names.
   */
  private readonly extensionPoints: Record<string, ExtensionPoint<Plugin> | ExtensionPoint<OrderedPlugin>> = {};

  /**
   * Initializes all predefined extension points.
   */
  constructor() {
    this.extensionPoints[ExtensionPointName.MAIN_MENU] = new MainMenuExtensionPoint();
    this.extensionPoints[ExtensionPointName.ROUTE] = new RouteExtensionPoint();
    this.extensionPoints[ExtensionPointName.INTERACTIVE_GUIDE] = new InteractiveGuideExtensionPoint();
    this.extensionPoints[ExtensionPointName.THEMES] = new ThemesExtensionPoint();
  }

  /**
   * Adds a plugin or multiple plugins to the registry for a specific extension point.
   * If a plugin has a unique ID and a plugin with the same ID already exists, the new plugin will replace the old one.
   *
   * @param extensionPointName - The name of the extension point to which the plugin(s) should be added.
   * @param plugin - The plugin or array of plugins to add to the registry.
   */
  add(extensionPointName: string, plugin: Plugin | Plugin[]): void {
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
  findPlugin<T extends Plugin>(extensionPointName: string,  predicate: (item: Plugin) => boolean): T | undefined {
    return this.get<T>(extensionPointName).find(predicate);
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
      throw new Error(`Extension point "${extensionPointName}" does not exist.`);
    }
    return extensionPoint;
  }

  /**
   * Registers the given plugin with the specified extension point.
   * Disabled plugins are ignored.
   *
   * @param extensionPoint - The extension point where the plugin will be registered.
   * @param plugin - The plugin to register.
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
        throw new Error(
          `There is already a plugin with the same order and priority. Extension point "${extensionPoint.name}", order "${plugin.order}".`
        );
      }
      if (plugin.priority > sameOrderPlugin.priority) {
        extensionPoint.removePlugin(sameOrderPlugin);
      }
    }

    extensionPoint.addPlugin(plugin);
    extensionPoint.sort((a: OrderedPlugin, b: OrderedPlugin) => a.order - b.order);
  }
}
