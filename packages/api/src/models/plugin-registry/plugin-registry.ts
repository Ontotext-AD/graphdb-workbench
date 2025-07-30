import {RouteModel} from '../routing/external-route-item-model';
import {ExtensionPoint} from './extension-point';
import {PluginDefinition} from './plugin-definition';

/**
 * PluginRegistry interface defines the methods for managing plugins in the application.
 */
export interface PluginRegistry {
  // TODO: make this generic as it needs to be
  get(extensionPoint: ExtensionPoint.ROUTE): RouteModel;

  add(pluginModule: PluginDefinition): void;
}
