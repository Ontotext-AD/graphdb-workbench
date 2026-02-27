import {Service} from '../../providers/service/service';
import {PluginRegistry} from '../../models/plugins';
import {getPathName} from '../utils';

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

  /**
   * Returns the document object associated with the current window. This method provides a way to access the document
   * object while allowing for easier testing and mocking in unit tests, as it relies on the getWindow method to
   * retrieve the window object.
   */
  static getDocument(): Document {
    return WindowService.getWindow().document;
  }

  static getPluginRegistry(): PluginRegistry {
    return WindowService.getWindow().PluginRegistry;
  }

  static getCrypto(): Crypto {
    return WindowService.getWindow().crypto;
  }

  static getLocationHref(): string {
    return WindowService.getWindow().location.href;
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

  static getLocationPathWithQueryParams(): string {
    return getPathName() + WindowService.getLocationQueryParams();
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
