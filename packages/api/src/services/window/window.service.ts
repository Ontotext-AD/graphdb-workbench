/**
 * Service that provides access to browser window-related functionality.
 */
import {Service} from '../../providers/service/service';
import {ExtensionPoint} from '../../models/plugin-registry/extension-point';
import {RouteModel} from '../../models/routing/external-route-item-model';

export class WindowService implements Service {
  /**
   * Retrieves the route plugins from the global window object.
   *
   * This function accesses the application's plugin registry and returns
   * the registered route extensions. It provides access to all routes
   * that have been registered by various plugins in the application.
   *
   * @returns {RouteModel} The route plugin registry containing all registered routes.
   */
  static getRoutePlugins(): RouteModel {
    return window.PluginRegistry.get(ExtensionPoint.ROUTE);
  }
}
