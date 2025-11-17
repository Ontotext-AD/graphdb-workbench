import {HttpErrorResponse, HttpOptions, HttpOptionsBodyResponse, HttpOptionsHttpResponse, HttpOptionsTypedResponse, HttpRequest, HttpRequestConfig, HttpResponse} from '../../models/http';
import {InterceptorService} from '../interceptor/interceptor.service';
import {ServiceProvider} from '../../providers';
import {EventEmitter} from '../../emitters/event.emitter';

export const HTTP_REQUEST_DONE_EVENT = 'http-request-done-event';

/**
 * A service class for performing HTTP requests.
 */
export class HttpService {
  private readonly interceptorService = ServiceProvider.get(InterceptorService);
  private readonly eventEmitter = new EventEmitter<undefined>();

  /**
   * Performs an HTTP GET request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  get<T>(url: string, options?: HttpOptions): Promise<T>

  /**
   * Performs an HTTP GET request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  get<T>(url: string, options?: HttpOptionsBodyResponse): Promise<T>

  /**
   * Performs an HTTP GET request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to HttpResponse<T> with the response data, status, and headers.
   */
  get<T>(url: string, options?: HttpOptionsHttpResponse): Promise<HttpResponse<T>>

  get<T>(url: string, options?: HttpOptionsTypedResponse): Promise<HttpResponse<T> | T> {
    const {params, headers, responseType = 'body'} = options ?? {};
    if (responseType === 'response') {
      return this.request<T>(url, 'GET', {params, headers}, 'response');
    }
    return this.request<T>(url, 'GET', {params, headers}, 'body');
  }

  /**
   * Performs an HTTP POST request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  post<T>(url: string, options?: HttpOptions): Promise<T>

  /**
   * Performs an HTTP POST request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  post<T>(url: string, options?: HttpOptionsBodyResponse): Promise<T>

  /**
   * Performs an HTTP POST request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to HttpResponse<T> with the response data, status, and headers.
   */
  post<T>(url: string, options?: HttpOptionsHttpResponse): Promise<HttpResponse<T>>

  post<T>(url: string, options?: HttpOptionsTypedResponse): Promise<HttpResponse<T> | T> {
    const {body, headers, responseType = 'body'} = options ?? {};
    if (responseType === 'response') {
      return this.request<T>(url, 'POST', {body, headers}, 'response');
    }
    return this.request<T>(url, 'POST', {body, headers}, 'body');
  }

  /**
   * Performs an HTTP PUT request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  put<T>(url: string, options?: HttpOptions): Promise<T>

  /**
   * Performs an HTTP PUT request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  put<T>(url: string, options?: HttpOptionsBodyResponse): Promise<T>

  /**
   * Performs an HTTP PUT request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to HttpResponse<T> with the response data, status, and headers.
   */
  put<T>(url: string, options?: HttpOptionsHttpResponse): Promise<HttpResponse<T>>

  put<T>(url: string, options?: HttpOptionsTypedResponse): Promise<HttpResponse<T> | T> {
    const {body, headers, responseType = 'body'} = options ?? {};
    if (responseType === 'response') {
      return this.request<T>(url, 'PUT', {body, headers}, 'response');
    }
    return this.request<T>(url, 'PUT', {body, headers}, 'body');
  }

  /**
   * Performs an HTTP PUT request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  patch<T>(url: string, options?: HttpOptions): Promise<T>

  /**
   * Performs an HTTP PUT request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  patch<T>(url: string, options?: HttpOptionsBodyResponse): Promise<T>

  /**
   * Performs an HTTP PUT request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to HttpResponse<T> with the response data, status, and headers.
   */
  patch<T>(url: string, options?: HttpOptionsHttpResponse): Promise<HttpResponse<T>>

  patch<T>(url: string, options?: HttpOptionsTypedResponse): Promise<HttpResponse<T> | T> {
    const {body, headers, responseType = 'body'} = options ?? {};
    if (responseType === 'response') {
      return this.request<T>(url, 'PATCH', {body, headers}, 'response');
    }
    return this.request<T>(url, 'PATCH', {body, headers}, 'body');
  }

  /**
   * Performs an HTTP DELETE request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  delete<T>(url: string, options?: HttpOptions): Promise<T>

  /**
   * Performs an HTTP DELETE request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  delete<T>(url: string, options?: HttpOptionsBodyResponse): Promise<T>

  /**
   * Performs an HTTP DELETE request.
   *
   * @param url     The URL to send the request to.
   * @param options (Optional) An object containing the request options.
   * @returns A Promise that resolves to HttpResponse<T> with the response data, status, and headers.
   */
  delete<T>(url: string, options?: HttpOptionsHttpResponse): Promise<HttpResponse<T>>

  delete<T>(url: string, options?: HttpOptionsTypedResponse): Promise<HttpResponse<T> | T> {
    const {headers, responseType = 'body'} = options ?? {};
    if (responseType === 'response') {
      return this.request<T>(url, 'DELETE', {headers}, 'response');
    }
    return this.request<T>(url, 'DELETE', {headers}, 'body');
  }

  /**
   * Uploads a file using an HTTP POST request with multipart/form-data.
   *
   * @param url          The URL to send the request to.
   * @param file         The file to upload.
   * @param fieldName    (Optional) The name of the form field for the file. Defaults to 'file'.
   * @param additionalData (Optional) Additional form fields to include in the upload.
   * @param headers      (Optional) An object containing additional request headers as key-value pairs.
   * @returns A Promise that resolves to HttpResponse<T> with the response data, status, and headers.
   */
  uploadFile<T>(
    url: string,
    file: File | Blob,
    fieldName = 'file',
    headers?: Record<string, string>,
    additionalData?: Record<string, string | Blob>
  ): Promise<HttpResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file, file instanceof File ? file.name : undefined);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Don't set Content-Type header - browser will set it automatically with boundary
    const uploadHeaders = {...headers};
    delete uploadHeaders['Content-Type'];

    return this.post<T>(url, {body: formData, headers: uploadHeaders, responseType: 'response'});
  }

  /**
   * Path string variable can contain characters which encodeURIComponent() can have problems encoding.
   * These characters are replaced in this method.
   * @param str - a component of URI
   * @returns {string} The provided string encoded as a URI component.
   */
  protected encodeURIComponentStrict(str: string): string {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }

  /**
   * Performs an HTTP request with the specified method and options.
   *
   * @param url     The URL to send the request to.
   * @param method  The HTTP method to use (GET, POST, PUT, DELETE).
   * @param options (Optional) An object containing the request options.
   *                 - `params`: Query parameters as key-value pairs.
   *                 - `headers`: Request headers as key-value pairs.
   *                 - `body`: The request body.
   * @returns A Promise that resolves with HttpResponse<T>, or is rejected with HttpErrorResponse if the request fails.
   */
  private request<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', options: HttpOptions = {}, responseType: 'response' | 'body' = 'response'): Promise<HttpResponse<T> | T> {
    const {fullUrl, headers} = this.getRequestConfig(url, options);
    const requestConfig = new HttpRequest({url: fullUrl, method, headers, body: options.body});
    let originalResponse: Response;

    return this.executeRequest(requestConfig)
      .then(async (response) => {
        originalResponse = response;
        if (!response.ok) {
          // Extract error data if available
          const data = await this.getDataFromResponse<T>(responseType, response);
          const errorResponse = new HttpErrorResponse({
            status: response.status,
            statusText: response.statusText,
            headers: this.extractHeaders(response),
            config: requestConfig,
            originalResponse: response,
            data
          });

          return Promise.reject(errorResponse);
        }
        const data = await this.getDataFromResponse<T>(responseType, response);

        if (responseType === 'body') {
          return data as T;
        }

        return new HttpResponse<T>({
          status: response.status,
          statusText: response.statusText,
          headers: this.extractHeaders(response),
          config: requestConfig,
          originalResponse: response,
          data
        });
      })
      .catch((error) => {
        // If it's already an HttpErrorResponse, just rethrow it
        if (error instanceof HttpErrorResponse) {
          return Promise.reject(error);
        }

        originalResponse ??= error;

        // The error is not from the HTTP fetch, but from internal logic
        const errorResponse = new HttpErrorResponse({
          status: originalResponse.status,
          statusText: originalResponse.statusText,
          headers: this.extractHeaders(originalResponse),
          config: requestConfig,
          originalResponse: originalResponse,
          data: null
        });
        if (error?.message) {
          errorResponse.message = error.message;
        }

        return Promise.reject(errorResponse);
      })
      .finally(() => this.eventEmitter.emit({NAME: HTTP_REQUEST_DONE_EVENT, payload: undefined}));
  }

  private async getDataFromResponse<T>(responseType: 'response' | 'body' | 'string', response: Response): Promise<string | T | null> {
    let data: T | string | null = null;

    data = await response.text();
    if (!responseType || responseType === 'body' || responseType === 'response') {
      try {
        data = JSON.parse(data) as T;
      } catch {
        // not JSON
      }
    }
    return data;
  }

  private getRequestConfig(url: string, options: HttpOptions): HttpRequestConfig {
    const queryString = this.buildQueryParams(options.params);
    const fullUrl = `${url}${queryString ? `?${queryString}` : ''}`;

    // Don't set Content-Type for FormData - browser will set it automatically with boundary
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
      ...options.headers
    };

    if (!isFormData) {
      headers['Content-Type'] = options.headers?.['Content-Type'] ?? 'application/json';
    }

    return {fullUrl, headers};
  }

  private formatBody(headers: Record<string, string | undefined>, body: unknown): BodyInit | null {
    if (!body) {
      return null;
    }

    // FormData should be sent as-is
    if (body instanceof FormData) {
      return body;
    }

    if (headers['Content-Type']?.includes('application/json')) {
      return JSON.stringify(body);
    } else if (headers['Content-Type']?.includes('application/x-www-form-urlencoded')) {
      return body as URLSearchParams;
    }
    return body as BodyInit;
  }

  private executeRequest(request: HttpRequest): Promise<Response> {
    return this.interceptorService.preProcess(request)
      .then((request) => {
        const body = this.formatBody(request.headers, request.body);

        return fetch(request.url, {
          method: request.method,
          headers: request.headers as HeadersInit,
          body
        });
      })
      .then((response) => this.interceptorService.postProcess(response));
  }

  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
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
