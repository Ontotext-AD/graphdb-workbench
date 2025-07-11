import {RouteRegexParamPair} from '../../models/routing/route-regex-param-pair';
import {RouteItemModel} from '../../models/routing/route-item-model';
import {getPathName} from '../utils';
import {ModelList} from '../../models/common';
import {Service} from '../../providers/service/service';
import {WindowService} from '../window/window.service';

/**
 * Service responsible for handling application routing functionality.
 *
 * This service provides methods for matching URL paths against registered routes,
 * converting route patterns to regular expressions, and retrieving active routes.
 * It works with the application's route configuration obtained from the PluginRegistry.
 */
export class RoutingService implements Service {
  private readonly routeConfig = WindowService.getRoutePlugins();

  /**
   * Finds and returns the active route based on the provided path.
   * Compares the path against registered routes in the route configuration
   * and returns the first matching route as a RouteItemModel.
   *
   * @param path - The URL path to match against registered routes.
   *               Defaults to the current path from getPathName() if not provided.
   * @returns A RouteItemModel instance representing the matched route,
   *          or undefined if no matching route is found.
   */
  getActiveRoute(path: string = getPathName()): RouteItemModel | undefined {
    const activeRoute = this.routeConfig
      .find((route) => {
        const regex = this.routeToRegex(route.url).getRegex();
        return regex.test(path);
      });

    return activeRoute ? new RouteItemModel(activeRoute) : undefined;
  }

  /**
   * Converts a route path string to a regular expression for route matching.
   * Handles route parameters with various options (optional, wildcard).
   *
   * @param path - The route path pattern to convert (e.g., '/users/:id', '/items/:name?')
   * @returns A RouteRegexParamPair containing the compiled regular expression
   *          and a list of parameter names extracted from the path.
   */
  private routeToRegex(path: string): RouteRegexParamPair {
    const keys: string[] = [];

    const pattern = path
      .replace(/([().])/g, '\\$1')
      .replace(/(\/)?:(\w+)(\*\?|[?*])?/g, function (_, slash, key, option) {
        const optional = option === '?' || option === '*?';
        const star = option === '*' || option === '*?';
        keys.push(key);
        slash = slash || '';
        return (
          (optional ? '(?:' + slash : slash + '(?:') +
          (star ? '(.+?)' : '([^/]+)') +
          (optional ? '?)?' : ')')
        );
      })
      .replace(/([/$*])/g, '\\$1');

    return new RouteRegexParamPair(new RegExp('^' + pattern + '(?:[?#]|$)'), new ModelList<string>(keys));
  }
}
