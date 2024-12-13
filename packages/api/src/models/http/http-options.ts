/**
 * Represents the options that can be used for an HTTP request.
 */
export interface HttpOptions {
  /**
   * Optional headers for the HTTP request.
   *
   * A record of key-value pairs where the key is the header name and the value is the header value.
   *
   * Example:
   * ```
   * {
   *   'Authorization': 'Bearer token',
   *   'Content-Type': 'application/json'
   * }
   * ```
   */
  headers?: Record<string, string>;

  /**
   * Optional body for the HTTP request.
   *
   * Can be any type of data, such as a JSON object or form data, depending on the request requirements.
   */
  body?: unknown;

  /**
   * Optional query parameters for the HTTP request.
   *
   * A record of key-value pairs where the key is the parameter name, and the value can be a string or a number.
   * These parameters will be serialized and appended to the URL as a query string.
   *
   * Example:
   * ```
   * {
   *   page: 1,
   *   search: 'keyword'
   * }
   * ```
   */
  params?: Record<string, string | number>;
}
