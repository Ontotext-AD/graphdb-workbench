import {ExtensionPoint} from './extension-point';
import {PluginDefinition} from './plugin-definition';
import {PluginsManifest} from './plugins-manifest';

/**
 * PluginRegistry interface defines the methods for managing plugins in the application.
 */
export interface PluginRegistry {
  /**
   * Retrieves the plugin definition for a given extension point.
   * @param extensionPoint - The extension point for which to retrieve the plugin definition.
   * @return The plugin definition associated with the specified extension point.
   */
  get<T>(extensionPoint: ExtensionPoint): T;

  /**
   * Adds a plugin definition to the registry for a specific extension point.
   * @param extensionPoint - The extension point to which the plugin definition should be added.
   * @param pluginDefinition - The plugin definition to add to the registry.
   */
  add(extensionPoint: ExtensionPoint, pluginDefinition: PluginDefinition): void;

  /**
   * Sets the plugins manifest for the registry.
   * @param pluginsManifest - The plugins manifest to set in the registry.
   */
  setPluginsManifest(pluginsManifest: PluginsManifest): void;
}
