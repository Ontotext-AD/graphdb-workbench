import {ModelList} from '../common';
import {HttpInterceptor} from './http-interceptor';

/**
 * A list specifically designed to hold HTTP interceptors for processing HTTP responses.
 */
export class HttpInterceptorList extends ModelList<HttpInterceptor<Response>> {
  constructor(httpInterceptors?: HttpInterceptor<Response>[]) {
    super(httpInterceptors);
  }
}
