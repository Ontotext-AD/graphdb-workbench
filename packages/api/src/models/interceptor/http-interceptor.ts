import {HttpRequest} from '../http/http-request';

/**
 * Defines the structure for an HTTP interceptor.
 * This class allows for processing of HTTP requests or responses.
 * A class extending this can override the `process` and `shouldProcess` methods to customize the HTTP
 * request and response flow.
 */
export abstract class HttpInterceptor<T extends HttpRequest | Response> {
  /** Priority of the interceptor. Higher values indicate earlier execution. */
  priority = 0;

  /**
   * Processes an HTTP request or response.
   * This method can be used to modify or enhance the request or response.
   *
   * @param data - The original HTTP request or response to be processed.
   * @returns A promise that resolves to the processed HTTP request or response.
   */
  abstract process(data: T): Promise<T>

  /**
   * Determines whether the processing step should be applied to the given HTTP request or response.
   * This method allows for conditional processing based on the request's or response's properties.
   *
   * @param data - The HTTP request or response to be evaluated.
   * @returns A boolean indicating whether the processing should be applied (true) or skipped (false).
   */
  abstract shouldProcess(data: T): boolean;
}
