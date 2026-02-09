import {ModelList} from '../common';
import {HttpInterceptor} from './http-interceptor';
import {HttpRequest} from '../http';

/**
 * A list specifically designed to hold HTTP interceptors for processing HTTP responses.
 * This class extends the generic ModelList to provide type safety and convenience methods for managing HTTP interceptors.
 * @template T - The type of HTTP message (either HttpRequest or Response) that the interceptors in this list will process.
 * @see HttpInterceptor
 */
export class HttpInterceptorList<T extends HttpRequest | Response> extends ModelList<HttpInterceptor<T>> {
  constructor(httpInterceptors?: HttpInterceptor<T>[]) {
    super(httpInterceptors);
  }
}
