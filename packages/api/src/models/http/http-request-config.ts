/**
 * Interface representing the configuration for an HTTP request.
 */
export interface HttpRequestConfig {
  fullUrl: string;
  headers: Record<string, string>;
}
