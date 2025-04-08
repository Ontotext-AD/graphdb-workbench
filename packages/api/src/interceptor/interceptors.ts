import {HttpInterceptor} from '../models/interceptor/http-interceptor';
import {HttpRequest} from '../models/http/http-request';
import {ModelList} from '../models/common';

/**
 * An array of HTTP request interceptors to be used in the application.
 */
export const REQUEST_INTERCEPTORS = new ModelList<HttpInterceptor<HttpRequest>>([
  // Request interceptors go here
  // new AuthRequestInterceptor()
]);

/**
 * An array of HTTP response interceptors to be used in the application.
 */
export const RESPONSE_INTERCEPTORS = new ModelList<HttpInterceptor<Response>> ([
  // Response interceptors go here
]);
