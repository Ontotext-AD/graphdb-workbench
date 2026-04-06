import {HttpResponseBase, HttpResponseBaseInit} from './http-response-base';

/**
 * A type that represents the possible results of an HTTP response, which can be an instance of HttpResponse, a raw data
 * object, or a Blob.
 */
export type HttpResponseResult<T> = HttpResponse<T> | T | Blob;

/**
 * A type that represents the possible data returned by an HTTP response, which can be a string, an object of type T,
 * or null.
 */
export type HttpResponseData<T> = string | T | null

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

