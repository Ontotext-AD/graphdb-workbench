import {SecurityRestService} from '../security-rest.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {AuthenticatedUser} from '../../../models/security';
import {AuthSettingsRequestModel} from '../../../models/security/response-models/auth-settings-request-model';

describe('SecurityRestService', () => {
  let securityRestService: SecurityRestService;

  beforeEach(() => {
    securityRestService = new SecurityRestService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('loginGdbToken', () => {
    test('should send POST request to login endpoint with credentials', async () => {
      // Given, I have username and password
      const username = 'testuser';
      const password = 'testpass';
      const url = 'rest/login';
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {get: () => 'application/json'},
        json: async () => ({token: 'mock-token'}),
        text: async () => 'Success'
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockResponse));

      // When, I call loginGdbToken
      const result = await securityRestService.loginGdbToken(username, password);

      // Then, I expect the response to be returned
      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({username, password})
      }));
    });
  });

  describe('updateUserData', () => {
    test('should send PATCH request to update user data', async () => {
      // Given, I have an authenticated user with app settings
      const user = new AuthenticatedUser({
        username: 'testuser',
        appSettings: {theme: 'dark', language: 'en'}
      });
      const url = 'rest/security/users/testuser';
      const mockResponse = {};

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockResponse));

      // When, I call updateUserData
      await securityRestService.updateUserData(user);

      // Then, I expect PATCH request with app settings
      expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({appSettings: user.appSettings})
      }));
    });

    test('should encode special characters in username', async () => {
      // Given, I have a user with special characters in username
      const user = new AuthenticatedUser({
        username: 'test@user.com',
        appSettings: {theme: 'light'}
      });
      const url = 'rest/security/users/test%40user.com';
      const mockResponse = {};

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockResponse));

      // When, I call updateUserData
      await securityRestService.updateUserData(user);

      // Then, I expect the username to be encoded
      expect(fetch).toHaveBeenCalledWith(url, expect.anything());
    });
  });

  describe('getSecurityConfig', () => {
    test('should send GET request to retrieve security config', async () => {
      // Given, I have a security config response
      const url = 'rest/security/all';
      const mockSecurityConfig = {
        enabled: true,
        freeAccess: {enabled: false}
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockSecurityConfig));

      // When, I call getSecurityConfig
      const result = await securityRestService.getSecurityConfig();

      // Then, I expect the security config to be returned
      expect(result).toEqual(mockSecurityConfig);
      expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method: 'GET'
      }));
    });
  });

  describe('getAuthenticatedUser', () => {
    test('should send GET request to retrieve authenticated user', async () => {
      // Given, I have an authenticated user response
      const url = 'rest/security/authenticated-user';
      const mockUser = {
        username: 'admin',
        authorities: ['ROLE_ADMIN'],
        external: false
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockUser));

      // When, I call getAuthenticatedUser
      const result = await securityRestService.getAuthenticatedUser();

      // Then, I expect the authenticated user to be returned
      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method: 'GET'
      }));
    });
  });

  describe('getAdminUser', () => {
    test('should send GET request to retrieve admin user', async () => {
      // Given, I have an admin user response
      const url = 'rest/security/users/admin';
      const mockAdminUser = {
        username: 'admin',
        authorities: ['ROLE_ADMIN'],
        external: false
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockAdminUser));

      // When, I call getAdminUser
      const result = await securityRestService.getAdminUser();

      // Then, I expect the admin user to be returned
      expect(result).toEqual(mockAdminUser);
      expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method: 'GET'
      }));
    });
  });

  describe('getFreeAccess', () => {
    test('should send GET request to retrieve free access settings', async () => {
      // Given, I have free access settings response
      const url = 'rest/security/free-access';
      const mockFreeAccess = {
        enabled: true,
        authorities: ['ROLE_USER'],
        appSettings: {}
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockFreeAccess));

      // When, I call getFreeAccess
      const result = await securityRestService.getFreeAccess();

      // Then, I expect the free access settings to be returned
      expect(result).toEqual(mockFreeAccess);
      expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method: 'GET'
      }));
    });
  });

  describe('setFreeAccess', () => {
    test('should send POST request to update free access settings', async () => {
      // Given, I have new free access settings
      const url = 'rest/security/free-access';
      const freeAccessData: AuthSettingsRequestModel = {
        enabled: true,
        authorities: ['ROLE_USER'],
        appSettings: {defaultLanguage: 'en'}
      };
      const mockResponse = {
        enabled: true,
        authorities: ['ROLE_USER'],
        appSettings: {defaultLanguage: 'en'}
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockResponse));

      // When, I call setFreeAccess
      const result = await securityRestService.setFreeAccess(freeAccessData);

      // Then, I expect the updated settings to be returned
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(freeAccessData)
      }));
    });
  });
});

