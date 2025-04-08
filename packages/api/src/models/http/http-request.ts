/**
 * Represents an HTTP request with its essential properties.
 */
export class HttpRequest {
  /** The URL of the request. */
  url: string;

  /** The HTTP method of the request (e.g., GET, POST, PUT, DELETE). */
  method: string;

  /** A key-value pair object representing the headers of the request. */
  headers: Record<string, string | undefined>;

  /** The body of the request. Can be of any type or undefined. */
  body?: unknown;

  constructor(data: HttpRequest) {
    this.url = data.url;
    this.method = data.method;
    this.headers = {...data.headers};
    this.body = data.body;
  }
}
