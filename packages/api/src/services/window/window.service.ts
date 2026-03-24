import {Service} from '../../providers/service/service';
import {PluginRegistry} from '../plugins';

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
   * Returns the parent window object of the current window. This is useful for accessing properties and methods of the
   * parent window, especially in cases where the current window is an iframe or a child window.
   * @returns The parent window object of the current window, which can be used to access properties and methods of the
   * parent window.
   */
  static getParentWindow(): Window {
    return WindowService.getWindow().parent;
  }

  /**
   * Returns the referer of the current document. The referer is the URL of the page that linked to the current page.
   * @returns The referer of the current document, which is the URL of the page that linked to the current page.
   * If the referer is not available or cannot be parsed, it returns the default value '*'.
   */
  static getReferer(): string {
    let targetOrigin = '*';
    if (WindowService.getDocument().referrer) {
      try {
        const url = new URL(WindowService.getDocument().referrer);
        if (url.origin) {
          targetOrigin = url.origin;
        }
      } catch (e) {
        // If document.referrer is malformed, fall back to the default targetOrigin
        console.warn(`Failed to parse document.referrer: ${WindowService.getDocument().referrer}. Using default targetOrigin '*'`, e);
      }
    }
    return targetOrigin;
  }

  /**
   * Returns the document object associated with the current window. This method provides a way to access the document
   * object.
   */
  static getDocument(): Document {
    return WindowService.getWindow().document;
  }

  /**
   * Returns the PluginRegistry instance from the global window object. This allows for accessing the plugin registry
   * in a way that can be easily mocked in unit tests.
   * @returns The PluginRegistry instance from the global window object.
   */
  static getPluginRegistry(): PluginRegistry {
    return WindowService.getWindow().PluginRegistry;
  }

  /**
   * Sets the PluginRegistry instance on the global window object.
   * @param pluginRegistry The PluginRegistry instance to set on the global window object.
   */
  static setPluginRegistry(pluginRegistry: PluginRegistry): void {
    this.getWindow().PluginRegistry = pluginRegistry;
  }

  /**
   * Returns the Crypto object associated with the current window. This method provides a way to access the Crypto API.
   * @returns The Crypto object from the current window, which provides access to cryptographic functions and secure
   * random number generation.
   */
  static getCrypto(): Crypto {
    return WindowService.getWindow().crypto;
  }

  /**
   * Returns the current URL of the browser window. This method provides a way to access the location.href property.
   * @returns The current URL of the browser window, which includes the protocol, hostname, port (if specified), path,
   * query parameters, and hash fragment.
   */
  static getLocationHref(): string {
    return WindowService.getWindow().location.href;
  }

  /**
   * Sets the current URL of the browser window to the specified href. This method provides a way to change the
   * location.href property.
   * @param href The URL to set as the current location of the browser window. This should be a valid URL string that
   * includes the protocol, hostname, port (if specified), path, query parameters, and hash fragment as needed. Setting
   * this will cause the browser to navigate to the specified URL.
   */
  static setLocationHref(href: string): void {
    WindowService.getWindow().location.href = href;
  }

  /**
   * Returns the query parameters from the current URL of the browser window. This method provides a way to access the
   * location.search property.
   * @returns The query parameters from the current URL of the browser window, which is the part of the URL that comes after
   * the '?' character and includes any key-value pairs representing parameters passed in the URL.
   */
  static getLocationQueryParams(): string {
    return WindowService.getWindow().location.search;
  }

  /**
   * Returns the hash fragment from the current URL of the browser window. This method provides a way to access the
   * location.hash property.
   * @returns The hash fragment from the current URL of the browser window, which is the part of the URL that comes after
   * the '#' character and is often used to represent a specific section or state within a page.
   */
  static getLocationHash(): string {
    return WindowService.getWindow().location.hash;
  }

  /**
   * Evaluates a media query and returns a MediaQueryList object representing the results of the query.
   * @param query The media query string to evaluate.
   * @returns A MediaQueryList object that can be used to check the results of the media query.
   */
  static matchMedia(query: string): MediaQueryList {
    return WindowService.getWindow().matchMedia(query);
  }

  /**
   * Retrieves the pathname portion of the current URL. This is the part of the URL that comes after the domain and
   * before any query parameters or hash fragments. It is often used to determine the current route or page within a web
   * application.
   * @returns The pathname of the current URL, which represents the path segment that comes after the domain and before
   * any query parameters or hash fragments.
   */
  static getLocationPathname(): string {
    return WindowService.getWindow().location.pathname;
  }

  /**
   * Retrieves the origin of the current URL, which includes the protocol, hostname, and port (if specified). The origin
   * is used to determine the base URL of the application and is important for security and cross-origin requests.
   * @returns The origin of the current URL, including the protocol, hostname, and port (if specified).
   */
  static getLocationOrigin(): string {
    return WindowService.getWindow().location.origin;
  }

  /**
   * Retrieves the base href from the `<base>` tag in the document. This is typically used to determine the base path
   * under which the application is deployed, which can be important for constructing URLs and navigating within the
   * application.
   * @returns The base href specified in the `<base>` tag, or '/' if the tag is not present or does not have an href
   * attribute.
   */
  static getBaseHref(): string {
    return WindowService.getDocument().querySelector('base')?.getAttribute('href') ?? '/';
  }

  /**
   * Opens a new browser window or tab with the specified URL and target. The target parameter specifies where to open
   * the URL, such as '_blank' for a new tab, '_self' for the same window, '_parent' for the parent frame, or '_top' for
   * the full body of the window. This method provides a way to programmatically open new windows or tabs while allowing
   * for easier testing and mocking in unit tests.
   * @param url The URL to open in the new window or tab.
   * @param target The target where the URL should be opened, such as '_blank', '_self', '_parent', or '_top'.
   * @param features Optional window features string (e.g. 'noopener,noreferrer')
   */
  static openWindow(url: string, target: string, features?: string): void {
    WindowService.getWindow().open(url, target, features);
  }

  /**
   * Navigates to the specified URL using the single-spa framework. This method is used to programmatically change the
   * current route within a single-spa application, allowing for seamless navigation without a full page reload. The URL
   * should be a valid route within the single-spa application for the navigation to work correctly.
   * @param url The URL to navigate to within the single-spa application. This should be a valid route that the
   * single-spa application can handle.
   */
  static navigateSingleSpa(url: string): void {
    WindowService.getWindow().singleSpa.navigateToUrl(url);
  }
}
