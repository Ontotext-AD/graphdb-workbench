import {ResponseMock} from '../../http/test/response-mock';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../security';
import {ServiceProvider} from '../../../providers';
import {ConfigurationContextService} from '../../configuration/configuration-context.service';
import {Service} from '../../../providers/service/service';

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
          headers: matchingMock.getHeaders() || { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
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

  /**
   * Mocks the ServiceProvider to return mocked instances of services.
   * This is useful for unit testing services that depend on other services.
   *
   * Services can be added and mocks can be extended as needed.
   *
   * @returns An object containing the mocked services.
   */
  static mockServiceProvider(): Record<string, jest.Mocked<unknown>> {
    // Mocks for dependencies
    const mockSecurityService = {
      getAuthenticatedUser: jest.fn(),
      loginGdbToken: jest.fn(),
      getAdminUser: jest.fn()
    } as never;
    const mockAuthStorageService = {
      setAuthToken: jest.fn(),
      clearAuthToken: jest.fn(),
      getAuthToken: jest.fn(() => ({getValue: jest.fn()}))
    } as never;
    const mockSecurityContextService = {
      updateAuthenticatedUser: jest.fn(),
      getSecurityConfig: jest.fn()
    } as never;
    const mockConfigurationContextService = {
      getApplicationConfiguration: jest.fn()
    } as never;

    const mockedServices = {
      [SecurityService.name]: mockSecurityService,
      [AuthenticationStorageService.name]: mockAuthStorageService,
      [SecurityContextService.name]: mockSecurityContextService,
      [ConfigurationContextService.name]: mockConfigurationContextService
    };

    jest.spyOn(ServiceProvider, 'get').mockImplementation((svc: new () => Service): Service => {
      const service = mockedServices[svc.name];
      if (service) {
        return service;
      }
      // @ts-expect-error This is a workaround for the type incompatibility between ServiceProvider and the mocked services
      return null;
    });

    return mockedServices;
  }
}
