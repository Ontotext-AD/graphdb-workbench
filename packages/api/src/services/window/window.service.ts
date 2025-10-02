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
}
