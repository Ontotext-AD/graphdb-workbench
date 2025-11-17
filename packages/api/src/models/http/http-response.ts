import {HttpResponseBase, HttpResponseBaseInit} from './http-response-base';

/**
 * Initialization parameters for HttpResponse.
 */
export interface HttpResponseInit<T = unknown> extends HttpResponseBaseInit {
  /** The response body/data returned by the server. */
  data: string | T | null;
}

/**
 * Represents a successful HTTP response.
 *
 * This model is inspired by Axios and AngularJS $http response structure.
 *
 * @template T The type of the response data.
 */
export class HttpResponse<T = unknown> extends HttpResponseBase {
  /**
   * The response body/data returned by the server.
   */
  data: string | T | null;

  constructor(init: HttpResponseInit<T>) {
    super(init);
    this.data = init.data;
  }
}

