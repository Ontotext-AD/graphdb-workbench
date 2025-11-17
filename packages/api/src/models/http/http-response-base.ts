import {HttpRequest} from './http-request';

/**
 * Initialization parameters for HttpResponseBase.
 */
export interface HttpResponseBaseInit {
  /** The HTTP status code of the response (e.g., 200, 201, 404, 500). */
  status: number;
  /** The HTTP status text (e.g., "OK", "Not Found", "Bad Request"). */
  statusText: string;
  /** The response headers as a key-value map. */
  headers: Record<string, string>;
  /** The request configuration that was used for this request. */
  config: HttpRequest;
  /** The original Response object from the Fetch API. */
  originalResponse: Response;
}

/**
 * Base class for HTTP responses containing common properties.
 *
 * This base class is extended by both HttpResponse (successful responses)
 * and HttpErrorResponse (error responses) to avoid code duplication.
 */
export abstract class HttpResponseBase {
  /**
   * The HTTP status code of the response (e.g., 200, 201, 404, 500).
   */
  status: number;

  /**
   * The HTTP status text (e.g., "OK", "Not Found", "Bad Request").
   */
  statusText: string;

  /**
   * The response headers as a key-value map.
   */
  headers: Record<string, string>;

  /**
   * The request configuration that was used for this request.
   */
  config: HttpRequest;

  /**
   * The original Response object from the Fetch API.
   * Useful for accessing additional properties or methods not exposed in this model.
   */
  readonly originalResponse?: Response;

  protected constructor(init: HttpResponseBaseInit) {
    this.status = init.status;
    this.statusText = init.statusText;
    this.headers = init.headers;
    this.config = init.config;
    this.originalResponse = init.originalResponse;
  }
}

