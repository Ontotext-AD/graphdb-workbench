import {WindowService} from '../window';
import {CookieStore} from './cookie-store';

/**
 * Implementation of {@link CookieStore} that interacts with the browser's `document.cookie` API.
 */
export class BrowserCookieStore implements CookieStore {
  /**
   * Reads the current cookies from the browser's `document.cookie` and returns them as a string.
   * @return A string containing all cookies in the format "key=value; key2=value2; ...".
   */
  read(): string {
    return WindowService.getDocument().cookie;
  }

  /**
   * Writes a cookie string to the browser's `document.cookie`, which will set or update the cookie in the browser.
   * @param cookie - A string representing the cookie to be set, in the format "key=value; attribute1; attribute2; ...".
   *                 For example: "sessionId=abc123; Path=/; Expires=Wed, 21 Oct 2025 07:28:00 GMT".
   *                 The cookie string can include optional attributes such as Path, Expires, Domain, Secure, HttpOnly, and SameSite.
   *                 The `CookieBuilder` class can be used to construct properly formatted cookie strings with these attributes.
   */
  write(cookie: string): void {
    WindowService.getDocument().cookie = cookie;
  }
}
