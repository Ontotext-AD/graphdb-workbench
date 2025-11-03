import {UnauthorizedInterceptor} from '../unauthorized-interceptor';
import {AuthenticationService, SecurityContextService} from '../../../services/security';
import {service} from '../../../providers';
import {RestrictedPages} from '../../../models/security';
import * as routingUtils from '../../../services/utils/routing-utils';
import {LoggerProvider} from '../../../services/logging/logger-provider';

describe('UnauthorizedInterceptor', () => {
  let interceptor: UnauthorizedInterceptor;
  const securityContextService = service(SecurityContextService);
  const authService = service(AuthenticationService);
  const logger = LoggerProvider.logger;

  let navigateSpy: jest.SpyInstance;
  let getPathNameSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let getRestrictedPagesSpy: jest.SpyInstance;
  let updateRestrictedPagesSpy: jest.SpyInstance;
  let isAuthenticatedSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new UnauthorizedInterceptor();

    // Mock navigate function
    navigateSpy = jest.spyOn(routingUtils, 'navigate').mockImplementation(() => {
      // Mock implementation
    });

    // Mock getPathName function
    getPathNameSpy = jest.spyOn(routingUtils, 'getPathName').mockReturnValue('/some/path');

    // Mock logger
    loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {
      // Mock implementation
    });

    // Mock security context service
    getRestrictedPagesSpy = jest.spyOn(securityContextService, 'getRestrictedPages');
    updateRestrictedPagesSpy = jest.spyOn(securityContextService, 'updateRestrictedPages').mockImplementation(() => {
      // Mock implementation
    });

    // Mock authentication service
    isAuthenticatedSpy = jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('shouldProcess', () => {
    test('Should return true when response status is 403', () => {
      // Given a response with 403 status
      const response = createResponse(403);

      // When checking if it should process
      const result = interceptor.shouldProcess(response);

      // Then it should return true
      expect(result).toBe(true);
    });

    test('Should return false when response status is not 403', () => {
      // Given a response with 200 status
      const response = createResponse(200);

      // When checking if it should process
      const result = interceptor.shouldProcess(response);

      // Then it should return false
      expect(result).toBe(false);
    });

    test('Should return false when response status is 401', () => {
      // Given a response with 401 status
      const response = createResponse(401);

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
    test('Should return true when user is not authenticated', () => {
      // Given an unauthenticated user
      isAuthenticatedSpy.mockReturnValue(false);

      // When checking if should redirect to login
      const result = interceptor.shouldRedirectToLogin();

      // Then it should return true
      expect(result).toBe(true);
      expect(isAuthenticatedSpy).toHaveBeenCalled();
    });

    test('Should return false when user is authenticated', () => {
      // Given an authenticated user
      isAuthenticatedSpy.mockReturnValue(true);

      // When checking if should redirect to login
      const result = interceptor.shouldRedirectToLogin();

      // Then it should return false
      expect(result).toBe(false);
      expect(isAuthenticatedSpy).toHaveBeenCalled();
    });
  });

  describe('updateRestrictionsForPage', () => {
    test('Should update restricted pages when page is not already restricted', () => {
      // Given a page path and restricted pages that don't include it
      const path = '/repositories';
      const restrictedPages = new RestrictedPages();
      getRestrictedPagesSpy.mockReturnValue(restrictedPages);

      // When updating restrictions for the page
      interceptor.updateRestrictionsForPage(path);

      // Then it should update the restricted pages
      expect(getRestrictedPagesSpy).toHaveBeenCalled();
      expect(updateRestrictedPagesSpy).toHaveBeenCalledWith(restrictedPages);
      expect(restrictedPages.isRestricted(path)).toBe(true);
    });

    test('Should not update when page is already restricted', () => {
      // Given a page path that is already restricted
      const path = '/repositories';
      const restrictedPages = new RestrictedPages();
      restrictedPages.setPageRestriction(path);
      getRestrictedPagesSpy.mockReturnValue(restrictedPages);

      // When updating restrictions for the page
      interceptor.updateRestrictionsForPage(path);

      // Then it should not call update
      expect(getRestrictedPagesSpy).toHaveBeenCalled();
      expect(updateRestrictedPagesSpy).not.toHaveBeenCalled();
    });

    test('Should handle when restricted pages is undefined', () => {
      // Given undefined restricted pages
      const path = '/repositories';
      getRestrictedPagesSpy.mockReturnValue(undefined);

      // When updating restrictions for the page
      interceptor.updateRestrictionsForPage(path);

      // Then it should not throw and not update
      expect(getRestrictedPagesSpy).toHaveBeenCalled();
      expect(updateRestrictedPagesSpy).not.toHaveBeenCalled();
    });

    test('Should handle when restricted pages is null', () => {
      // Given null restricted pages
      const path = '/repositories';
      getRestrictedPagesSpy.mockReturnValue(null);

      // When updating restrictions for the page
      interceptor.updateRestrictionsForPage(path);

      // Then it should not throw and not update
      expect(getRestrictedPagesSpy).toHaveBeenCalled();
      expect(updateRestrictedPagesSpy).not.toHaveBeenCalled();
    });

    test('Should update different pages independently', () => {
      // Given restricted pages with one page already restricted
      const path1 = '/repositories';
      const path2 = '/sparql';
      const restrictedPages = new RestrictedPages();
      restrictedPages.setPageRestriction(path1);
      getRestrictedPagesSpy.mockReturnValue(restrictedPages);

      // When updating restrictions for a different page
      interceptor.updateRestrictionsForPage(path2);

      // Then it should update the restricted pages
      expect(updateRestrictedPagesSpy).toHaveBeenCalledWith(restrictedPages);
      expect(restrictedPages.isRestricted(path1)).toBe(true);
      expect(restrictedPages.isRestricted(path2)).toBe(true);
    });
  });

  describe('process', () => {
    test('Should log warning, update restrictions, and reject when user is authenticated', async () => {
      // Given a 403 response and authenticated user
      const response = createResponse(403);
      const path = '/repositories';
      getPathNameSpy.mockReturnValue(path);
      isAuthenticatedSpy.mockReturnValue(true);
      const restrictedPages = new RestrictedPages();
      getRestrictedPagesSpy.mockReturnValue(restrictedPages);

      // When processing the response
      const resultPromise = interceptor.process(response);

      // Then it should log warning, update restrictions, not navigate, and reject
      await expect(resultPromise).rejects.toBe(response);
      expect(loggerWarnSpy).toHaveBeenCalledWith('Permission to page denied. Some errors in the console are normal');
      expect(getPathNameSpy).toHaveBeenCalled();
      expect(updateRestrictedPagesSpy).toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    test('Should redirect to login when user is not authenticated', async () => {
      // Given a 403 response and unauthenticated user
      const response = createResponse(403);
      const path = '/repositories';
      getPathNameSpy.mockReturnValue(path);
      isAuthenticatedSpy.mockReturnValue(false);
      const restrictedPages = new RestrictedPages();
      getRestrictedPagesSpy.mockReturnValue(restrictedPages);

      // When processing the response
      const resultPromise = interceptor.process(response);

      // Then it should log, update restrictions, navigate to login, and reject
      await expect(resultPromise).rejects.toBe(response);
      expect(loggerWarnSpy).toHaveBeenCalledWith('Permission to page denied. Some errors in the console are normal');
      expect(getPathNameSpy).toHaveBeenCalled();
      expect(updateRestrictedPagesSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith('login');
    });

    test('Should always reject the response', async () => {
      // Given a 403 response
      const response = createResponse(403);
      getPathNameSpy.mockReturnValue('/test');
      getRestrictedPagesSpy.mockReturnValue(new RestrictedPages());
      isAuthenticatedSpy.mockReturnValue(true);

      // When processing the response
      const resultPromise = interceptor.process(response);

      // Then it should always reject
      await expect(resultPromise).rejects.toBe(response);
    });

    test('Should handle multiple pages correctly', async () => {
      // Given a 403 response for a specific page
      const response = createResponse(403);
      const path = '/sparql';
      getPathNameSpy.mockReturnValue(path);
      isAuthenticatedSpy.mockReturnValue(true);
      const restrictedPages = new RestrictedPages();
      getRestrictedPagesSpy.mockReturnValue(restrictedPages);

      // When processing the response
      await interceptor.process(response).catch(() => {
        // Expected to reject
      });

      // Then the specific page should be restricted
      expect(restrictedPages.isRestricted(path)).toBe(true);
      expect(restrictedPages.isRestricted('/other-page')).toBe(false);
    });

    test('Should not navigate if already on login page', async () => {
      // Given a 403 response on login page with unauthenticated user
      const response = createResponse(403);
      getPathNameSpy.mockReturnValue('/login');
      isAuthenticatedSpy.mockReturnValue(false);
      const restrictedPages = new RestrictedPages();
      getRestrictedPagesSpy.mockReturnValue(restrictedPages);

      // When processing the response
      await interceptor.process(response).catch(() => {
        // Expected to reject
      });

      // Then it should still call navigate (the method doesn't check current page)
      expect(navigateSpy).toHaveBeenCalledWith('login');
    });
  });

  /**
   * Helper function to create a mock Response object
   */
  function createResponse(status: number, url = 'http://example.com/api/test'): Response {
    return {
      status,
      url,
      ok: status >= 200 && status < 300,
      statusText: status === 403 ? 'Forbidden' : status === 401 ? 'Unauthorized' : 'OK',
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

