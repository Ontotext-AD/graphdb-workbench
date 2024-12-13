export class TestUtil {

  /**
   * Mocks the global fetch response.
   *
   * @param response The mock response data to return when fetch is called.
   * @param status The HTTP status code to return.
   * @param message An optional message returned by the `text()` method of the response
   */
  static mockResponse(response: unknown, status = 200, message = ''): void {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => response,
        text: async () => message
      } as Response),
    );
  }

  /**
   * Clears all mocks after each test to ensure isolation.
   */
  static restoreAllMocks(): void {
    jest.restoreAllMocks();
  }
}
