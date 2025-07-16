import {Service} from '../../providers/service/service';
import {ExtensionPoint} from '../../models/plugin-registry/extension-point';
import {RouteModel} from '../../models/routing/external-route-item-model';
import {ExternalMenuModel} from '../../models/plugin-registry/external-menu-model';

/**
 * Service that provides access to browser window-related functionality.
 */
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

  /**
   * Retrieves the main menu plugins from the global window object.
   *
   * This function accesses the application's plugin registry and returns
   * the registered main menu extensions. It provides access to all main menu
   * items that have been registered by various plugins in the application.
   *
   * @returns {ExternalMenuModel} The main menu plugin registry containing all registered main menu items.'
   */
  static getMainMenuPlugins(): ExternalMenuModel {
    return window.PluginRegistry.get(ExtensionPoint.MAIN_MENU);
  }

  /**
   * Retrieves the current pathname from the browser's location.
   *
   * @returns {string} The current pathname from the browser's location.
   */
  static getPathName(): string {
    return window.location.pathname;
  }

  /**
   * Opens a URL in a new browser tab or window.
   *
   * @param {string} url - The URL to open in the new tab or window.
   */
  static openInNewTab(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Navigates to a specified URL using the single-spa framework.
   *
   * This function uses the single-spa navigation system to perform
   * client-side routing within the application, maintaining the
   * single-page application context.
   *
   * @param {string} url - The URL to navigate to within the application.
   */
  static navigateToUrl(url: string): void {
    window.singleSpa.navigateToUrl(url);
  }

  /**
   * Retrieves the current width of the browser window.
   *
   * @returns {number} The current width of the browser window.
   */
  static getInnerWidth(): number {
    return window.innerWidth;
  }

  /**
   * Add an event listener to the browser window.
   *
   * @param event - The event type to listen for.
   * @param callback - The callback function to execute when the event occurs.
   */
  static addEventListener(event: string, callback: (event: Event) => void): void {
    window.addEventListener(event, callback);
  }

  /**
   * Sets an interval for the given callback, with the specified delay.
   * @param callback - The callback function to execute periodically.
   * @param delay - The delay in milliseconds between each execution of the callback.
   */
  static setInterval(callback: () => void, delay?: number): number {
    return window.setInterval(callback, delay);
  }

  /**
   * Sets a timeout for the given callback, with the specified delay.
   * @param callback - The callback function to execute after the specified delay.
   * @param delay - The delay in milliseconds before executing the callback.
   */
  static setTimeout(callback: () => void, delay?: number): number {
    return window.setTimeout(callback, delay);
  }

  /**
   * Checks if the application is running in development mode.
   *
   * @returns {boolean} True if the application is running in development mode, false otherwise.
   */
  static isDevMode(): boolean {
    return window.wbDevMode;
  }
}
