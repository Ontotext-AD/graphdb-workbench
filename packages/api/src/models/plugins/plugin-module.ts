import {PluginRegistry} from './plugin-registry';

/**
 * PluginModule interface represents a plugin module that can be registered with the PluginRegistry.
 */
export interface PluginModule {
  register: (registry: PluginRegistry) => void;
}
