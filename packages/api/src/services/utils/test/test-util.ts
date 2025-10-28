import {ResponseMock} from '../../http/test/response-mock';

export class TestUtil {
  private static requestsMap = new Map<string, RequestInit>();

  static getRequest(url: string): RequestInit | undefined {
    return TestUtil.requestsMap.get(url);
  }

  static mockResponse(responseMock: ResponseMock): void {
    TestUtil.mockResponses([responseMock]);
  }

  static mockResponses(responseMocks: ResponseMock[]): void {
    global.fetch = jest.fn((input: string | URL | Request, request: RequestInit) => {
      let url;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        url = input.url;
      }
      const matchingMock = responseMocks.find((mock) => mock.getUrl() === url);
      if (matchingMock) {
        TestUtil.requestsMap.set(url, request);
        const headers = matchingMock.getHeaders() ?? new Headers();
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
        return Promise.resolve({
          ok: matchingMock.getStatus() >= 200 && matchingMock.getStatus() < 300,
          status: matchingMock.getStatus(),
          headers,
          json: async () => matchingMock.getShouldThrowOnJson() ? Promise.reject(new Error('JSON error')) : Promise.resolve(matchingMock.getResponse()),
          text: async () => matchingMock.getMessage(),
        } as Response);
      }

      // Return a default 404 response if no matching mock found
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({message: 'Not Found'}),
        text: async () => 'Not Found',
      } as Response);
    }) as jest.Mock;
  }

  /**
   * Clears all mocks after each test to ensure isolation.
   */
  static restoreAllMocks(): void {
    jest.restoreAllMocks();
    this.requestsMap.clear();
  }
}
