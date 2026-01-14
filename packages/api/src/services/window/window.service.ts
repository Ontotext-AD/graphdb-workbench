import {Service} from '../../providers/service/service';
import {PluginRegistry} from '../../models/plugins';

/**
 * Service that provides access to browser window-related functionality.
 */
export class WindowService implements Service {

  /**
   * Returns the current browser window object. The purpose of this encapsulation is to allow for
   * better testability and easier mocking of the window object in unit tests.
   */
  static getWindow(): Window {
    return window;
  }

  static getPluginRegistry(): PluginRegistry {
    return WindowService.getWindow().PluginRegistry;
  }

  static getCrypto(): Crypto {
    return WindowService.getWindow().crypto;
  }

  static setLocationHref(href: string): void {
    WindowService.getWindow().location.href = href;
  }

  static getLocationQueryParams(): string {
    return WindowService.getWindow().location.search;
  }

  static getLocationHash(): string {
    return WindowService.getWindow().location.hash;
  }

  static getLocationPathname(): string {
    return WindowService.getWindow().location.pathname;
  }

  /**
   * Evaluates a media query and returns a MediaQueryList object representing the results of the query.
   * @param query The media query string to evaluate.
   * @returns A MediaQueryList object that can be used to check the results of the media query.
   */
  static matchMedia(query: string): MediaQueryList {
    return WindowService.getWindow().matchMedia(query);
  }
}
