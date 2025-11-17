import {HttpResponseBase, HttpResponseBaseInit} from './http-response-base';

/**
 * Initialization parameters for HttpErrorResponse.
 */
export interface HttpErrorResponseInit<T = unknown> extends HttpResponseBaseInit {
  /** The error response body/data returned by the server (if any). */
  data: T;
  /** The type of error that occurred. */
  errorType?: 'response' | 'network' | 'timeout' | 'abort' | 'unknown';
}

/**
 * Represents an HTTP error response.
 *
 * This model is inspired by Axios error structure and AngularJS $http error handling.
 * Used with Promise.reject() to provide detailed error information.
 *
 * @template T The type of the error response data (if any).
 */
export class HttpErrorResponse<T = unknown> extends HttpResponseBase {
  /**
   * The error response body/data returned by the server (if any).
   * This could be an error message, validation errors, or any other error payload.
   */
  data: T | null;

  /**
   * Optional error message providing additional context.
   */
  message?: string;

  constructor(init: HttpErrorResponseInit<T>) {
    super(init);
    this.data = init.data ?? null;

    // If the response was successful, then this was a parse error. Otherwise, it was
    // a protocol-level failure of some sort. Either the request failed in transit
    // or the server returned an unsuccessful status code.
    if (this.status >= 200 && this.status < 300) {
      this.message = `Http failure during parsing for ${init.config.url || '(unknown url)'}`;
    } else {
      this.message = `Http failure response for ${init.config.url || '(unknown url)'}: ${init.status} ${init.statusText}`;
    }
  }

  /**
   * Indicates whether the error was due to a client error (4xx status codes).
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Indicates whether the error was due to a server error (5xx status codes).
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

