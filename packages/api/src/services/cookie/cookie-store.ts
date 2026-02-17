/**
 * Interface for cookie store implementations.
 * Defines methods for reading and writing cookies, abstracting away the underlying storage mechanism.
 */
export interface CookieStore {
  /**
   * Reads the current cookies from the store and returns them as a string.
   * @return A string containing all cookies in the format "key=value; key2=value2; ...".
   */
  read(): string;
  /**
   * Writes a cookie string to the store, which will set or update the cookie in the underlying storage mechanism.
   * @param cookie - A string representing the cookie to be set, in the format "key=value; attribute1; attribute2; ...".
   */
  write(cookie: string): void;
}
