import {HttpInterceptor} from '../models/interceptor/http-interceptor';
import {HttpRequest} from '../models/http/http-request';
import {ModelList} from '../models/common';

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Interceptors are loaded via factories with deferred imports to avoid circular dependencies.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/**
 * Factory functions for creating request interceptors with deferred imports.
 */
const REQUEST_INTERCEPTOR_FACTORIES = [
  async () => {
    const {AuthRequestInterceptor} = await import('./auth/auth-request-interceptor');
    return new AuthRequestInterceptor();
  }
];

/**
 * Factory functions for creating response interceptors with deferred imports.
 */
const RESPONSE_INTERCEPTOR_FACTORIES = [
  async () => {
    const {UnauthorizedInterceptor} = await import('./auth/unauthorized-interceptor');
    return new UnauthorizedInterceptor();
  },
];

export const REQUEST_INTERCEPTORS = new ModelList<HttpInterceptor<HttpRequest>>([]);
export const RESPONSE_INTERCEPTORS = new ModelList<HttpInterceptor<Response>>([]);

export async function initializeInterceptors() {
  if (REQUEST_INTERCEPTORS.getItems().length === 0) {
    const requestInterceptors = await Promise.all(REQUEST_INTERCEPTOR_FACTORIES.map(factory => factory()));
    REQUEST_INTERCEPTORS.addItems(requestInterceptors);
  }

  if (RESPONSE_INTERCEPTORS.getItems().length === 0) {
    const responseInterceptors = await Promise.all(RESPONSE_INTERCEPTOR_FACTORIES.map(factory => factory()));
    RESPONSE_INTERCEPTORS.addItems(responseInterceptors);
  }
}
