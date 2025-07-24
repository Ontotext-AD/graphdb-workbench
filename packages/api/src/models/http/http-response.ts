export interface HttpResponse<T> extends Response {
  /**
   * Override the standard json() so that it returns Promise<T>
   * instead of Promise<any>
   */
  json(): Promise<T>;
}
