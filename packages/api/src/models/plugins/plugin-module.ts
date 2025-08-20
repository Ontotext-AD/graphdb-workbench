import {PluginRegistry} from './plugin-registry';

/**
 * PluginModule interface represents a plugin module that can be registered with the PluginRegistry.
 */
export interface PluginModule {
  /**
   * Registers the plugin module with the provided PluginRegistry.
   * @param registry - The PluginRegistry instance to register the plugin module with.
   */
  register: (registry: PluginRegistry) => void;
}
