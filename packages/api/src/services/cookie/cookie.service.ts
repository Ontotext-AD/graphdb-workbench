import {Service} from '../../providers/service/service';
import {CookieBuilder} from './cookie-builder';
import {WindowService} from '../window';

/**
 * Service to manage cookies for the application. It sets it, retrieves it, or deletes it when required.
 *
 * @param {Object} $document - AngularJS service to manage document.
 * @param {Object} $cookies - AngularJS service to manage cookies.
 * @return {Object} - Returns an object with methods to get, set, and remove cookies.
 */
export class CookieService implements Service {
  /**
   * Retrieves the value of a cookie by its key.
   *
   * @param key - The name of the cookie to retrieve.
   * @return The value of the cookie, or `undefined` if the cookie doesn't exist.
   */
  get(key: string): string | undefined {
    return this.parseCookies()[key];
  }

  /**
   * Sets a cookie with the given key, value, and options.
   *
   * @param key - The name of the cookie to set.
   * @param value - The value of the cookie to set.
   * @param [options={}] - Optional parameters for cookie settings.
   */
  set(key: string, value: string, options = {}) {
    WindowService.getDocument().cookie = new CookieBuilder(key, value, options).build();
  }

  /**
   * Deletes a cookie by setting an expired date, effectively removing it from the browser.
   *
   * @param key - The name of the cookie to delete.
   */
  remove(key: string) {
    WindowService.getDocument().cookie = new CookieBuilder(key, '', {expiration: -1}).build();
  }

  /**
   * Retrieves all cookies.
   *
   * @return - An object containing all cookies as key-value pairs.
   */
  getAll(): Record<string, string> {
    return this.parseCookies();
  }

  /**
   * Parses the document's cookie string and returns an object containing all cookies as key-value pairs.
   *
   * @return - An object where each key is a cookie name and each value is the corresponding cookie value.
   */
  parseCookies(): Record<string, string> {
    const result: Record<string, string> = {};
    const cookies = WindowService.getDocument().cookie.split('; ');

    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key && value) {
        result[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }

    return result;
  }
}
