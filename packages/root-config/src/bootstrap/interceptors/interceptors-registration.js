import {AuthRequestInterceptor, HttpInterceptorList, InterceptorService, service, UnauthenticatedInterceptor, UnauthorizedInterceptor} from '@ontotext/workbench-api';

/**
 * An array of HTTP request interceptors to be used in the application.
 */
const REQUEST_INTERCEPTORS = [
  new AuthRequestInterceptor(),
];

/**
 * An array of HTTP response interceptors to be used in the application.
 */
const RESPONSE_INTERCEPTORS = [
  new UnauthenticatedInterceptor(),
  new UnauthorizedInterceptor(),
];

export const registerInterceptors = () => {
  const interceptorsService = service(InterceptorService);

  interceptorsService.registerRequestInterceptors(new HttpInterceptorList(REQUEST_INTERCEPTORS));
  interceptorsService.registerResponseInterceptors(new HttpInterceptorList(RESPONSE_INTERCEPTORS));

  return Promise.resolve();
};
