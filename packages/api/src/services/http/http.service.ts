import {HttpOptions} from '../../models/http/http-options';

/**
 * A service class for performing HTTP requests.
 */
export class HttpService {

  /**
   * Performs an HTTP GET request.
   *
   * @param url     The URL to send the request to.
   * @param params  (Optional) An object containing query parameters as key-value pairs.
   * @param headers (Optional) An object containing request headers as key-value pairs.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  get<T>(url: string, params?: Record<string, string | number>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, 'GET', {params, headers})
      .then((response) => {
        return response;
      });
  }

  /**
   * Performs an HTTP POST request.
   *
   * @param url     The URL to send the request to.
   * @param body    (Optional) The body of the request.
   * @param headers (Optional) An object containing request headers as key-value pairs.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  post<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, 'POST', {body, headers});
  }

  /**
   * Performs an HTTP PUT request.
   *
   * @param url     The URL to send the request to.
   * @param body    (Optional) The body of the request.
   * @param headers (Optional) An object containing request headers as key-value pairs.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  put<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, 'PUT', {body, headers});
  }

  /**
   * Performs an HTTP DELETE request.
   *
   * @param url     The URL to send the request to.
   * @param headers (Optional) An object containing request headers as key-value pairs.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, 'DELETE', {headers});
  }

  /**
   * Performs an HTTP request with the specified method and options.
   *
   * @param url     The URL to send the request to.
   * @param method  The HTTP method to use (GET, POST, PUT, DELETE).
   * @param options (Optional) An object containing the request options, including:
   *                 - `params`: Query parameters as key-value pairs.
   *                 - `headers`: Request headers as key-value pairs.
   *                 - `body`: The request body.
   * @returns A Promise that resolves with the response data of type T, or is rejected with an error if the request fails.
   */
  private request<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', options: HttpOptions = {}): Promise<T> {
    const queryString = this.buildQueryParams(options.params);
    const fullUrl = `${url}${queryString ? `?${queryString}` : ''}`;

    return fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : null,
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        return response.json() as Promise<T>;
      });
  }

  /**
   * Builds a query string from an object of parameters.
   *
   * @param params An object containing query parameters as key-value pairs.
   * @returns A query string suitable for appending to a URL.
   */
  private buildQueryParams(params: Record<string, string | number> = {}): string {
    // @ts-expect-error JavaScript will automatically convert numbers into strings when they are passed to URLSearchParams, TypeScript doesn't know that this is safe.
    return new URLSearchParams(params).toString();
  }
}
