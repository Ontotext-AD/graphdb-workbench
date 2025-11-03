import {UnauthenticatedInterceptor} from '../unauthenticated-interceptor';
import {AuthenticationStorageService, AuthenticationService} from '../../../services/security';
import {service} from '../../../providers';
import {WindowService} from '../../../services/window';
import * as routingUtils from '../../../services/utils/routing-utils';

describe('UnauthenticatedInterceptor', () => {
  let interceptor: UnauthenticatedInterceptor;
  const authStorage = service(AuthenticationStorageService);
  const authService = service(AuthenticationService);

  let navigateSpy: jest.SpyInstance;
  let windowReloadSpy: jest.SpyInstance;
  let clearAuthTokenSpy: jest.SpyInstance;
  let isExternalUserSpy: jest.SpyInstance;
  let isLoginPageSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new UnauthenticatedInterceptor();

    // Mock navigate function
    navigateSpy = jest.spyOn(routingUtils, 'navigate').mockImplementation(() => {
      // Mock implementation
    });

    // Mock isLoginPage function - default to false (not on login page)
    isLoginPageSpy = jest.spyOn(routingUtils, 'isLoginPage').mockReturnValue(false);

    // Mock window reload
    const reloadMock = jest.fn();
    const mockWindow = {
      location: {
        reload: reloadMock
      }
    } as unknown as Window;
    windowReloadSpy = reloadMock;
    jest.spyOn(WindowService, 'getWindow').mockReturnValue(mockWindow);

    // Mock auth storage
    clearAuthTokenSpy = jest.spyOn(authStorage, 'clearAuthToken').mockImplementation(() => {
      // Mock implementation
    });

    // Mock auth service
    isExternalUserSpy = jest.spyOn(authService, 'isExternalUser').mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('shouldProcess', () => {
    test('Should return true when response status is 401', () => {
      // Given a response with 401 status
      const response = createResponse(401);

      // When checking if it should process
      const result = interceptor.shouldProcess(response);

      // Then it should return true
      expect(result).toBe(true);
    });

    test('Should return false when response status is not 401', () => {
      // Given a response with 200 status
      const response = createResponse(200);

      // When checking if it should process
      const result = interceptor.shouldProcess(response);

      // Then it should return false
      expect(result).toBe(false);
    });

    test('Should return false when response status is 403', () => {
      // Given a response with 403 status
      const response = createResponse(403);

      // When checking if it should process
      const result = interceptor.shouldProcess(response);

      // Then it should return false
      expect(result).toBe(false);
    });

    test('Should return false when response status is 500', () => {
      // Given a response with 500 status
      const response = createResponse(500);

      // When checking if it should process
      const result = interceptor.shouldProcess(response);

      // Then it should return false
      expect(result).toBe(false);
    });
  });

  describe('shouldRedirectToLogin', () => {
    test('Should return true for regular API endpoint with non-external user', () => {
      // Given a regular API URL and non-external user
      isExternalUserSpy.mockReturnValue(false);

      // When checking if should redirect to login
      const result = interceptor.shouldRedirectToLogin('rest/repositories');

      // Then it should return true
      expect(result).toBe(true);
    });

    test('Should return false for authenticated-user endpoint', () => {
      // Given the authenticated-user endpoint and non-external user
      isExternalUserSpy.mockReturnValue(false);

      // When checking if should redirect to login
      const result = interceptor.shouldRedirectToLogin('rest/security/authenticated-user');

      // Then it should return false (do not redirect)
      expect(result).toBe(false);
    });

    test('Should return false when user is external', () => {
      // Given an external user
      isExternalUserSpy.mockReturnValue(true);

      // When checking if should redirect to login
      const result = interceptor.shouldRedirectToLogin('rest/repositories');

      // Then it should return false (do not redirect for external auth)
      expect(result).toBe(false);
    });

    test('Should return false for authenticated-user endpoint with external user', () => {
      // Given the authenticated-user endpoint and external user
      isExternalUserSpy.mockReturnValue(true);

      // When checking if should redirect to login
      const result = interceptor.shouldRedirectToLogin('rest/security/authenticated-user');

      // Then it should return false
      expect(result).toBe(false);
    });
  });

  describe('process', () => {
    test('Should redirect to login and reload page when shouldRedirectToLogin returns true', async () => {
      // Given a 401 response for a regular endpoint with non-external user
      const response = createResponse(401, 'rest/repositories');
      isExternalUserSpy.mockReturnValue(false);

      // When processing the response
      const resultPromise = interceptor.process(response);

      // Then it should clear auth token, navigate to login, reload page, and reject
      await expect(resultPromise).rejects.toBe(response);
      expect(clearAuthTokenSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).toHaveBeenCalledWith('login');
      expect(windowReloadSpy).toHaveBeenCalledTimes(1);
    });

    test('Should not redirect when response is for authenticated-user endpoint', async () => {
      // Given a 401 response for authenticated-user endpoint
      const response = createResponse(401, 'rest/security/authenticated-user');
      isExternalUserSpy.mockReturnValue(false);

      // When processing the response
      const result = await interceptor.process(response);

      // Then it should resolve without redirecting
      expect(result).toBe(response);
      expect(clearAuthTokenSpy).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(windowReloadSpy).not.toHaveBeenCalled();
    });

    test('Should not redirect when user is external', async () => {
      // Given a 401 response with external user
      const response = createResponse(401, 'rest/repositories');
      isExternalUserSpy.mockReturnValue(true);

      // When processing the response
      const result = await interceptor.process(response);

      // Then it should resolve without redirecting
      expect(result).toBe(response);
      expect(clearAuthTokenSpy).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(windowReloadSpy).not.toHaveBeenCalled();
    });

    test('Should handle authenticated-user endpoint with partial URL match', async () => {
      // Given a 401 response for authenticated-user endpoint with query params
      const response = createResponse(401, 'rest/security/authenticated-user?test=true');
      isExternalUserSpy.mockReturnValue(false);

      // When processing the response
      const result = await interceptor.process(response);

      // Then it should resolve without redirecting
      expect(result).toBe(response);
      expect(clearAuthTokenSpy).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(windowReloadSpy).not.toHaveBeenCalled();
    });

    test('Should not redirect for endpoint that contains "authenticated-user" as substring', async () => {
      // Given a 401 response for a different endpoint that contains the substring
      const response = createResponse(401, 'rest/security/authenticated-user-settings');
      isExternalUserSpy.mockReturnValue(false);

      // When processing the response
      const result = await interceptor.process(response);

      // Then it should not redirect (because indexOf finds "authenticated-user" substring in the URL)
      expect(result).toBe(response);
      expect(clearAuthTokenSpy).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(windowReloadSpy).not.toHaveBeenCalled();
    });

    test('Should clear token but not navigate when already on login page', async () => {
      // Given a 401 response for a regular endpoint and user is already on login page
      const response = createResponse(401, 'rest/repositories');
      isExternalUserSpy.mockReturnValue(false);
      isLoginPageSpy.mockReturnValue(true);

      // When processing the response
      const resultPromise = interceptor.process(response);

      // Then it should clear auth token but not navigate or reload
      await expect(resultPromise).rejects.toBe(response);
      expect(clearAuthTokenSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy).not.toHaveBeenCalled();
      expect(windowReloadSpy).not.toHaveBeenCalled();
    });
  });

  /**
   * Helper function to create a mock Response object
   */
  function createResponse(status: number, url = 'api/test'): Response {
    return {
      status,
      url,
      ok: status >= 200 && status < 300,
      statusText: status === 401 ? 'Unauthorized' : 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
      clone: jest.fn(),
      bytes: jest.fn()
    } as unknown as Response;
  }
});

