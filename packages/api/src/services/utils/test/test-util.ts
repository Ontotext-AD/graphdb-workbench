import {ResponseMock} from '../../http/test/response-mock';

export class TestUtil {

  static mockResponse(responseMock: ResponseMock): void {
    TestUtil.mockResponses([responseMock]);
  }

  static mockResponses(responseMocks: ResponseMock[]): void {
    global.fetch = jest.fn((url: RequestInfo) => {
      const matchingMock = responseMocks.find((mock) => mock.getUrl() === url);

      if (matchingMock) {
        return Promise.resolve({
          ok: matchingMock.getStatus() >= 200 && matchingMock.getStatus() < 300,
          status: matchingMock.getStatus(),
          headers: { get: (name: string) => name === 'Content-Type'? 'application/json' : undefined },
          json: async () => matchingMock.getResponse(),
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
  }
}
