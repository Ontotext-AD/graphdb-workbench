import {HttpOptions} from '../../models/http/http-options';
import {InterceptorService} from '../interceptor/interceptor.service';
import {HttpRequest} from '../../models/http/http-request';
import {ServiceProvider} from '../../providers';
import {EventEmitter} from '../../emitters/event.emitter';
import {HttpRequestConfig} from '../../models/http/http-request-config';

const JSON_CONTENT_TYPES = ['application/json', 'application/sparql-results+json'];

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
   * Performs an HTTP POST request and returns full HttpResponse (body of type `T`, status, headers).
   *
   * @param url     The URL to send the request to.
   * @param body    (Optional) The body of the request.
   * @param headers (Optional) An object containing request headers as key-value pairs.
   * @returns A Promise that resolves to the full HttpResponse (body of type `T`, status, headers).
   */
  public postFull<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<Response> {
    return this.requestFull<T>(url, 'POST', {body, headers});
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
   * Uploads a file using an HTTP POST request with multipart/form-data.
   *
   * @param url          The URL to send the request to.
   * @param file         The file to upload.
   * @param fieldName    (Optional) The name of the form field for the file. Defaults to 'file'.
   * @param additionalData (Optional) Additional form fields to include in the upload.
   * @param headers      (Optional) An object containing additional request headers as key-value pairs.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  uploadFile<T>(
    url: string,
    file: File | Blob,
    fieldName = 'file',
    headers?: Record<string, string>,
    additionalData?: Record<string, string | Blob>,
  ): Promise<T> {
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

    return this.request<T>(url, 'POST', {body: formData, headers: uploadHeaders});
  }

  /**
   * Performs an HTTP PATCH request.
   *
   * @param url     The URL to send the request to.
   * @param body    (Optional) The body of the request.
   * @param headers (Optional) An object containing request headers as key-value pairs.
   * @returns A Promise that resolves to the response data of type `T`.
   */
  patch<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(url, 'PATCH', {body, headers});
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
   * @param options (Optional) An object containing the request options, including:
   *                 - `params`: Query parameters as key-value pairs.
   *                 - `headers`: Request headers as key-value pairs.
   *                 - `body`: The request body.
   * @returns A Promise that resolves with the response data of type T, or is rejected with an error if the request fails.
   */
  private request<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', options: HttpOptions = {}): Promise<T> {
    const {fullUrl, headers} = this.getRequestConfig(url, options);

    return this.executeRequest(new HttpRequest({url: fullUrl, method, headers, body: options.body}))
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        const isJson = this.hasValidJson(response);
        return (isJson ? response.json() : response.text()) as Promise<T>;
      })
      .finally(() => this.eventEmitter.emit({NAME: HTTP_REQUEST_DONE_EVENT, payload: undefined}));
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
      }
      )
      .then((response) => this.interceptorService.postProcess(response));
  }

  private hasValidJson(response: Response) {
    const responseContentType = response.headers.get('Content-Type');
    if (!responseContentType) {
      return false;
    }
    return JSON_CONTENT_TYPES.some((contentType) => responseContentType.includes(contentType));
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
   * @returns A Promise that resolves with the full HttpResponse (body of type `T`, status, headers), or is rejected with an error if the request fails.
   */
  private requestFull<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    options: HttpOptions = {}
  ): Promise<Response> {
    const {fullUrl, headers} = this.getRequestConfig(url, options);

    return this.executeRequest(new HttpRequest({url: fullUrl, method, headers, body: options.body}))
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response);
        }
        const isJson = this.hasValidJson(response);
        // FIXME: If it is not JSON, it resolve void, but it might be text
        const json = isJson ? response.json() : Promise.resolve();
        const text = !isJson ? response.text() : Promise.resolve();

        return Object.assign(response, {
          json: (): Promise<T> => Promise.resolve(json as T),
          text: (): Promise<T> => Promise.resolve(text as T)
        });
      })
      .finally(() => {
        this.eventEmitter.emit({NAME: HTTP_REQUEST_DONE_EVENT, payload: undefined});
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
