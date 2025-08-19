/**
 * PluginDefinition interface represents the structure of a plugin definition as used in the plugin manifest.
 */
export interface PluginDefinition {
  /**
   * The entry point of the plugin, typically a path to the main JavaScript file.
   */
  entry: string;
  /**
   * The name of the plugin.
   */
  name: string;
}
