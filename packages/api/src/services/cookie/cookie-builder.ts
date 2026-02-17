import {CookieOptions} from '../../models/cookie';
import {DateUtil} from '../utils/date-util';
import {InvalidCookieExpiration} from './error/invalid-cookie-expiration';

/**
* CookieBuilder class for constructing cookies with optional attributes (expiration, path, domain, etc.).
*/
export class CookieBuilder {
  private static readonly DEFAULT_PATH = '/';
  private static readonly MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

  key: string;
  value: string;
  expires?: string;
  path: string = CookieBuilder.DEFAULT_PATH;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;

  /**
   * Constructs a CookieBuilder instance with the given key, value, and options.
   *
   * @param key - The name of the cookie to set.
   * @param value - The value of the cookie to set.
   * @param [options={}] - Optional parameters for cookie settings (expiration, path, domain, etc.).
   */
  constructor(key: string, value: string, options: CookieOptions = {}) {
    this.key = encodeURIComponent(key);
    this.value = encodeURIComponent(value);
    this.setOptions(options);
  }

  /**
   * Sets the options for the cookie.
   *
   * @param options - Object containing optional cookie settings.
   * @return Returns the current instance for method chaining.
   */
  setOptions(options: CookieOptions): this {
    const {expiration, path, domain, secure, httpOnly, sameSite} = options;

    if (expiration) {
      this.setExpiration(expiration);
    }

    this.setPath(path);

    if (domain) {
      this.setDomain(domain);
    }

    if (secure) {
      this.setSecure();
    }

    if (httpOnly) {
      this.setHttpOnly();
    }

    if (sameSite) {
      this.setSameSite(sameSite);
    }

    return this;
  }

  /**
   * Sets the expiration date for the cookie in days.
   *
   * @param expiration - Number of days until the cookie expires.
   * @return Returns the current instance for method chaining.
   */
  setExpiration(expiration: number): this {
    if (!Number.isFinite(expiration)) {
      throw new InvalidCookieExpiration(`Invalid expiration value: ${expiration}`);
    }
    const date = new Date(DateUtil.now() + expiration * CookieBuilder.MILLISECONDS_PER_DAY);
    this.expires = date.toUTCString();
    return this;
  }

  /**
   * Sets the path where the cookie is available.
   *
   * @param path - The URL path for the cookie.
   * @return Returns the current instance for method chaining.
   */
  setPath(path?: string): this {
    this.path = path || CookieBuilder.DEFAULT_PATH;
    return this;
  }

  /**
   * Sets the domain where the cookie is available.
   *
   * @param domain - The domain for the cookie.
   * @return Returns the current instance for method chaining.
   */
  setDomain(domain: string): this {
    this.domain = domain;
    return this;
  }

  /**
   * Marks the cookie as secure (sent over HTTPS only).
   *
   * @return Returns the current instance for method chaining.
   */
  setSecure(): this {
    this.secure = true;
    return this;
  }

  /**
   * Marks the cookie as HttpOnly (inaccessible via JavaScript).
   *
   * @return Returns the current instance for method chaining.
   */
  setHttpOnly(): this {
    this.httpOnly = true;
    return this;
  }

  /**
   * Sets the SameSite attribute for the cookie.
   *
   * @param sameSite - SameSite attribute ('Strict', 'Lax', 'None').
   * @return Returns the current instance for method chaining.
   */
  setSameSite(sameSite: string): this {
    this.sameSite = sameSite;
    return this;
  }

  /**
   * Builds the final cookie string with all set attributes.
   *
   * @return - The complete cookie string.
   */
  build(): string {
    let cookieStr = `${this.key}=${this.value}`;

    if (this.expires) {
      cookieStr += `; expires=${this.expires}`;
    }

    cookieStr += `; path=${this.path}`;

    if (this.domain) {
      cookieStr += `; domain=${this.domain}`;
    }

    if (this.secure) {
      cookieStr += '; secure';
    }

    if (this.httpOnly) {
      cookieStr += '; HttpOnly';
    }

    if (this.sameSite) {
      cookieStr += `; SameSite=${this.sameSite}`;
    }

    return cookieStr;
  }
}
