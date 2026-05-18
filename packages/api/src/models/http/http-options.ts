import {HttpHeaders} from './http-headers';

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
  headers?: HttpHeaders;

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

  /**
   * Optional signal for aborting the HTTP request.
   * This allows you to cancel the request if needed, for example, when a component is unmounted or when a new request
   * is made before the previous one completes.
   */
  signal?: AbortSignal;
}

/**
 * The type of response expected from an HTTP request, which determines how the response data will be processed.
 */
export type SupportedResponseType = 'body' | 'response' | 'blob' | 'string';

/**
 * Extended to include a typed responseType property.
 * @inheritDoc
 */
export interface HttpOptionsTypedResponse extends HttpOptions {
  responseType?: SupportedResponseType;
}

/**
 * Specify that the `responseType` is 'body'.
 * @inheritDoc
 */
export interface HttpOptionsBodyResponse extends HttpOptionsTypedResponse {
  responseType: 'body';
}

/**
 * Specify that the `responseType` is 'response'.
 * @inheritDoc
 */
export interface HttpOptionsHttpResponse extends HttpOptionsTypedResponse {
  responseType: 'response';
}

/**
 * Specify that the `responseType` is 'blob'.
 */
export interface HttpOptionsBlobResponse extends HttpOptionsTypedResponse {
  responseType: 'blob';
}
