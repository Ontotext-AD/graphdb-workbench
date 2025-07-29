import {ExtensionPoint} from './extension-point';
import {PluginDefinition} from './plugin-definition';

/**
 * PluginRegistry interface defines the methods for managing plugins in the application.
 */
export interface PluginRegistry {
  get<T>(extensionPoint: ExtensionPoint): T;

  add(extensionPoint: ExtensionPoint, pluginDefinition: PluginDefinition): void;
}
