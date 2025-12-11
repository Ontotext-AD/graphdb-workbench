/**
 * PluginDefinition interface represents the structure of a plugin definition as used in the plugin manifest.
 */
export class PluginDefinition {
  constructor(
    /**
     * The entry point of the plugin, typically a path to the main JavaScript file.
     */
    readonly entry: string,
    /**
     * The name of the plugin.
     */
    readonly name: string
  ) {
  }
}
