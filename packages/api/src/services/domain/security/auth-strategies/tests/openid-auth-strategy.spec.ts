import {OpenidAuthStrategy} from '../openid-auth-strategy';
import {
  AuthenticationService,
  AuthenticationStorageService,
  OpenidStorageService,
  SecurityContextService,
  SecurityService
} from '../../index';
import {OpenIdService} from '../../openid';
import {OpenidTokenUtils} from '../../openid/openid-token-utils';
import {ServiceProvider} from '../../../../../providers';
import {LoggerProvider} from '../../../../logging/logger-provider';
import {TestUtil} from '../../../../utils/test/test-util';
import {AuthenticatedUser, OpenidSecurityConfig, SecurityConfig} from '../../../../../models/security';
import {OpenIdAuthFlowType} from '../../../../../models/security/authentication';
import {MissingOpenidConfiguration} from '../../errors/openid/missing-openid-configuration';
import {InvalidOpenidAuthFlow} from '../../errors/openid/invalid-openid-auth-flow';
import {ProviderResponseMocks} from './provider-response-mocks';
import {ResponseMock} from '../../../../http/test/response-mock';
import {WindowService} from '../../../../window';
import {SecurityConfigTestUtil} from '../../../../utils/test/security-config-test-util';

describe('OpenidAuthProvider', () => {
  let strategy: OpenidAuthStrategy;
  let securityContextService: SecurityContextService;
  let authenticationStorageService: AuthenticationStorageService;
  let openIdService: OpenIdService;
  let tokenUtils: OpenidTokenUtils;
  let securityService: SecurityService;
  let openidStorageService: OpenidStorageService;
  let authenticationService: AuthenticationService;

  let loggerDebugSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  /**
   * Creates a mock OpenID security configuration.
   */
  const createOpenIdConfig = (overrides: Partial<OpenidSecurityConfig> = {}): OpenidSecurityConfig => {
    return new OpenidSecurityConfig({
      clientId: 'test-client-id',
      oidcJwksUri: 'https://auth.example.com/keys',
      oidcTokenEndpoint: 'https://auth.example.com/token',
      oidcAuthorizationEndpoint: 'https://auth.example.com/authorize',
      oidcEndSessionEndpoint: 'https://auth.example.com/logout',
      authFlow: OpenIdAuthFlowType.CODE,
      ...overrides
    });
  };

  /**
   * Creates a mock security configuration with OpenID settings.
   */
  const getSecurityConfig = (openidConfig?: OpenidSecurityConfig) => {
    const config = {
      enabled: true,
      passwordLoginEnabled: false,
      openIdEnabled: true
    } as SecurityConfig;
    return SecurityConfigTestUtil.createSecurityConfig(config, openidConfig);
  };

  /**
   * Sets up the security configuration in the context service.
   */
  const setupSecurityConfig = (openidConfig?: OpenidSecurityConfig): void => {
    const securityConfig = getSecurityConfig(openidConfig);
    securityContextService.updateSecurityConfig(securityConfig);
  };

  /**
   * Mocks successful authentication flow.
   */
  const mockSuccessfulAuthentication = () => {
    jest.spyOn(openIdService, 'initializeOpenId').mockResolvedValue(true);
    jest.spyOn(tokenUtils, 'authHeaderGraphDB').mockReturnValue('Bearer test-token');
    TestUtil.mockResponse(
      new ResponseMock('rest/security/authenticated-user')
        .setResponse(ProviderResponseMocks.authenticatedUserResponse)
    );
  };

  beforeEach(() => {
    TestUtil.restoreAllMocks();
    jest.clearAllMocks();

    // Get service instances
    securityContextService = ServiceProvider.get(SecurityContextService);
    authenticationStorageService = ServiceProvider.get(AuthenticationStorageService);
    openIdService = ServiceProvider.get(OpenIdService);
    tokenUtils = ServiceProvider.get(OpenidTokenUtils);
    securityService = ServiceProvider.get(SecurityService);
    openidStorageService = ServiceProvider.get(OpenidStorageService);
    authenticationService = ServiceProvider.get(AuthenticationService);

    // Setup logger spies
    loggerDebugSpy = jest.spyOn(LoggerProvider.logger, 'debug');
    loggerErrorSpy = jest.spyOn(LoggerProvider.logger, 'error');

    // Clear security context
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    authenticationStorageService.clearAuthToken();
    openidStorageService.clearReturnUrl();

    // Mock window.singleSpa.navigateToUrl
    if (!window.singleSpa) {
      window.singleSpa = {} as never;
    }
    window.singleSpa.navigateToUrl = jest.fn();

    // Create strategy instance
    strategy = new OpenidAuthStrategy();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should set up configuration listener', () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);

      // Trigger configuration change
      const newConfig = getSecurityConfig(openidConfig);
      securityContextService.updateSecurityConfig(newConfig);

      // Strategy should have received the config
      expect(strategy['openIdSecurityConfig']).toEqual(openidConfig);
    });
  });

  describe('initialize', () => {
    it('should throw MissingOpenidConfiguration error when OpenID configuration is missing', async () => {
      setupSecurityConfig(); // No OpenID config
      const initializeOpenIdSpy = jest.spyOn(openIdService, 'initializeOpenId');

      await expect(strategy.initialize()).rejects.toThrow(MissingOpenidConfiguration);
      expect(initializeOpenIdSpy).not.toHaveBeenCalled();
    });

    it('should initialize OpenID and set auth token when user is authenticated', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      mockSuccessfulAuthentication();

      const result = await strategy.initialize();

      expect(result).toBe(true);
      expect(loggerDebugSpy).toHaveBeenCalledWith('OpenID: authentication initialized');
      expect(authenticationStorageService.getAuthToken().getValue()).toBe('Bearer test-token');
    });

    it('should load and set authenticated user when authentication succeeds', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      mockSuccessfulAuthentication();
      const getAuthenticatedUserSpy = jest.spyOn(securityService, 'getAuthenticatedUser');
      const updateAuthenticatedUserSpy = jest.spyOn(securityContextService, 'updateAuthenticatedUser');

      await strategy.initialize();

      expect(getAuthenticatedUserSpy).toHaveBeenCalled();
      expect(updateAuthenticatedUserSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testUser'
        })
      );
    });

    it('should navigate to return URL if present after successful authentication', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      mockSuccessfulAuthentication();
      openidStorageService.setReturnUrl('/repositories');

      await strategy.initialize();

      expect(window.singleSpa.navigateToUrl).toHaveBeenCalledWith('http://localhost/repositories');
      expect(openidStorageService.getReturnUrl().getValue()).toBeNull();
    });

    it('should not navigate if no return URL after successful authentication', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      mockSuccessfulAuthentication();

      await strategy.initialize();

      expect(window.singleSpa.navigateToUrl).not.toHaveBeenCalled();
    });

    it('should return false when loading authenticated user fails', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      jest.spyOn(openIdService, 'initializeOpenId').mockResolvedValue(true);
      jest.spyOn(tokenUtils, 'authHeaderGraphDB').mockReturnValue('Bearer test-token');
      const getAuthenticatedUserSpy = jest.spyOn(securityService, 'getAuthenticatedUser');
      getAuthenticatedUserSpy.mockRejectedValue(new Error('User load failed'));
      const updateAuthenticatedUserSpy = jest.spyOn(securityContextService, 'updateAuthenticatedUser');

      const result = await strategy.initialize();

      expect(result).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Could not initialize OpenID authentication',
        expect.any(Error)
      );
      expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
    });

    it('should return false when user is not authenticated', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      const initializeOpenIdSpy = jest.spyOn(openIdService, 'initializeOpenId');
      initializeOpenIdSpy.mockResolvedValue(false);

      const result = await strategy.initialize();

      expect(result).toBe(false);
      expect(authenticationStorageService.getAuthToken().getValue()).toBeNull();
    });

    it('should not load authenticated user when authentication fails', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      const initializeOpenIdSpy = jest.spyOn(openIdService, 'initializeOpenId');
      initializeOpenIdSpy.mockResolvedValue(false);
      const getAuthenticatedUserSpy = jest.spyOn(securityService, 'getAuthenticatedUser');
      const updateAuthenticatedUserSpy = jest.spyOn(securityContextService, 'updateAuthenticatedUser');

      await strategy.initialize();

      expect(getAuthenticatedUserSpy).not.toHaveBeenCalled();
      expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
    });

    it('should handle errors and clear authentication when OpenID initialization fails', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      const error = new Error('Init failed');
      const initializeOpenIdSpy = jest.spyOn(openIdService, 'initializeOpenId');
      initializeOpenIdSpy.mockRejectedValue(error);
      const clearAuthenticationSpy = jest.spyOn(openIdService, 'clearAuthentication');

      const result = await strategy.initialize();

      expect(result).toBe(false);
      expect(loggerDebugSpy).toHaveBeenCalledWith('OpenID: not logged or login error');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Could not initialize OpenID authentication', error);
      expect(authenticationStorageService.getAuthToken().getValue()).toBeNull();
      expect(clearAuthenticationSpy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw MissingOpenidConfiguration error when OpenID configuration is missing', () => {
      setupSecurityConfig(); // No OpenID config
      const setupCodeFlowSpy = jest.spyOn(openIdService, 'setupCodeFlow');

      expect(() => strategy.login()).toThrow(MissingOpenidConfiguration);
      expect(setupCodeFlowSpy).not.toHaveBeenCalled();
    });

    it('should initiate code flow with state and return URL for authorization code flow', async () => {
      const openidConfig = createOpenIdConfig({authFlow: OpenIdAuthFlowType.CODE});
      setupSecurityConfig(openidConfig);
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/');
      jest.spyOn(WindowService, 'getLocationOrigin').mockReturnValue('http://localhost:3000');
      const setupCodeFlowSpy = jest.spyOn(openIdService, 'setupCodeFlow');

      const promise = strategy.login();

      expect(setupCodeFlowSpy).toHaveBeenCalledWith(
        expect.any(String),
        'http://localhost:3000/'
      );
      expect(setupCodeFlowSpy.mock.calls[0][0]).toHaveLength(56); // state length (28 * 2 hex chars)

      // Verify promise never resolves (user gets redirected)
      const settled = await Promise.race([
        promise.then(() => 'resolved'),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 10))
      ]);
      expect(settled).toBe('timeout');
    });

    it('should initiate code flow without PKCE for CODE_NO_PKCE flow', () => {
      const openidConfig = createOpenIdConfig({authFlow: OpenIdAuthFlowType.CODE_NO_PKCE});
      setupSecurityConfig(openidConfig);
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/');
      jest.spyOn(WindowService, 'getLocationOrigin').mockReturnValue('http://localhost:3000');
      const setupCodeNoPkceFlowSpy = jest.spyOn(openIdService, 'setupCodeNoPkceFlow');

      strategy.login();

      expect(setupCodeNoPkceFlowSpy).toHaveBeenCalledWith(
        expect.any(String),
        'http://localhost:3000/'
      );
      expect(setupCodeNoPkceFlowSpy.mock.calls[0][0]).toHaveLength(56);
    });

    it('should initiate implicit flow for IMPLICIT flow type', () => {
      const openidConfig = createOpenIdConfig({authFlow: OpenIdAuthFlowType.IMPLICIT});
      setupSecurityConfig(openidConfig);
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/');
      jest.spyOn(WindowService, 'getLocationOrigin').mockReturnValue('http://localhost:3000');
      const setupImplicitFlowSpy = jest.spyOn(openIdService, 'setupImplicitFlow');

      strategy.login();

      expect(setupImplicitFlowSpy).toHaveBeenCalledWith(
        expect.any(String),
        'http://localhost:3000/'
      );
      expect(setupImplicitFlowSpy.mock.calls[0][0]).toHaveLength(56);
    });

    it('should throw InvalidOpenidAuthFlow error for unknown flow type', () => {
      const openidConfig = createOpenIdConfig({authFlow: 'unknown' as unknown as OpenIdAuthFlowType});
      setupSecurityConfig(openidConfig);
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/');
      jest.spyOn(WindowService, 'getLocationOrigin').mockReturnValue('http://localhost:3000');
      expect(() => strategy.login()).toThrow(InvalidOpenidAuthFlow);
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'OpenID: Invalid OpenID authentication flow: unknown'
      );
    });
  });

  describe('logout', () => {
    it('should log out from the OpenID provider by default', async () => {
      // Given I have an OpenID config with an end session endpoint
      setupSecurityConfig(createOpenIdConfig());
      const logoutSpy = jest.spyOn(openIdService, 'logout').mockImplementation(() => undefined);

      // When I log out
      const promise = strategy.logout();

      // Then I expect a logout from the OpenID provider
      expect(logoutSpy).toHaveBeenCalledWith(true);
      // And the promise to never resolve, as the user is redirected
      const settled = await Promise.race([
        promise.then(() => 'resolved'),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 10))
      ]);
      expect(settled).toBe('timeout');
    });

    it('should log out locally only when localLogoutOnly is set', async () => {
      // Given I have an OpenID config with localLogoutOnly set
      setupSecurityConfig(createOpenIdConfig({localLogoutOnly: true}));
      const logoutSpy = jest.spyOn(openIdService, 'logout').mockImplementation(() => undefined);

      // When I log out
      const result = await strategy.logout();

      // Then I expect a local logout only
      expect(logoutSpy).toHaveBeenCalledWith();
      // And the promise to resolve
      expect(result).toBeUndefined();
    });

    it('should log out locally only when the OpenID provider has no end session endpoint', async () => {
      // Given I have an OpenID config without an end session endpoint
      setupSecurityConfig(createOpenIdConfig({oidcEndSessionEndpoint: undefined}));
      const logoutSpy = jest.spyOn(openIdService, 'logout').mockImplementation(() => undefined);

      // When I log out
      const result = await strategy.logout();

      // Then I expect a local logout only
      expect(logoutSpy).toHaveBeenCalledWith();
      // And the promise to resolve
      expect(result).toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when auth token exists and security is enabled', () => {
      const openidConfig = createOpenIdConfig();
      const securityConfig = getSecurityConfig(openidConfig);
      securityContextService.updateSecurityConfig(securityConfig);
      authenticationStorageService.setAuthToken('Bearer test-token');

      expect(strategy.isAuthenticated()).toBe(true);
    });

    it('should return false when auth token is null and security is enabled', () => {
      const openidConfig = createOpenIdConfig();
      const securityConfig = getSecurityConfig(openidConfig);
      securityContextService.updateSecurityConfig(securityConfig);
      authenticationStorageService.clearAuthToken();

      expect(strategy.isAuthenticated()).toBe(false);
    });

    it('should return true when security is not enabled', () => {
      const securityConfig = getSecurityConfig();
      securityConfig.enabled = false;
      securityContextService.updateSecurityConfig(securityConfig);
      jest.spyOn(authenticationService, 'isSecurityEnabled').mockReturnValue(false);

      expect(strategy.isAuthenticated()).toBe(true);
    });
  });

  describe('type property', () => {
    it('should have type OPENID', () => {
      expect(strategy.type).toBe('OPENID');
    });
  });

  describe('configuration listener', () => {
    it('should update internal config when security config changes', () => {
      const firstConfig = createOpenIdConfig({clientId: 'client-1'});
      setupSecurityConfig(firstConfig);

      expect(strategy['openIdSecurityConfig']?.clientId).toBe('client-1');

      const secondConfig = createOpenIdConfig({clientId: 'client-2'});
      setupSecurityConfig(secondConfig);

      expect(strategy['openIdSecurityConfig']?.clientId).toBe('client-2');
    });

    it('should handle null security config', () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);

      expect(strategy['openIdSecurityConfig']).toBeDefined();

      securityContextService.updateSecurityConfig(null as unknown as SecurityConfig);

      // Config should not be cleared if null is passed (listener checks for truthy)
      expect(strategy['openIdSecurityConfig']).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete authentication flow', async () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      mockSuccessfulAuthentication();

      const isLoggedIn = await strategy.initialize();

      expect(isLoggedIn).toBe(true);
      expect(strategy.isAuthenticated()).toBe(true);
      expect(authenticationStorageService.getAuthToken().getValue()).toBe('Bearer test-token');
      expect(securityContextService.getAuthenticatedUser()?.username).toBe('testUser');
    });

    it('should handle complete local logout flow', async () => {
      // Given I have an OpenID config with localLogoutOnly set
      setupSecurityConfig(createOpenIdConfig({localLogoutOnly: true}));
      // And I am logged in
      authenticationStorageService.setAuthToken('Bearer test-token');
      const authenticatedUser = ProviderResponseMocks.authenticatedUserResponse as unknown as AuthenticatedUser;
      securityContextService.updateAuthenticatedUser(authenticatedUser);
      const setLocationHrefSpy = jest.spyOn(WindowService, 'setLocationHref').mockImplementation(() => undefined);

      // When I log out
      await strategy.logout();

      // Then I expect the auth token to be cleared
      expect(authenticationStorageService.getAuthToken().getValue()).toBeNull();
      // And no redirect to the OpenID provider
      expect(setLocationHrefSpy).not.toHaveBeenCalled();
    });

    it('should handle complete logout flow from the OpenID provider', () => {
      // Given I have an OpenID config with an end session endpoint
      setupSecurityConfig(createOpenIdConfig());
      jest.spyOn(WindowService, 'getLocationOrigin').mockReturnValue('http://localhost:3000');
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/');
      // And I am logged in with an ID token
      authenticationStorageService.setAuthToken('Bearer test-token');
      openidStorageService.setIdToken('id-token');
      const setLocationHrefSpy = jest.spyOn(WindowService, 'setLocationHref').mockImplementation(() => undefined);

      // When I log out
      void strategy.logout();

      // Then I expect the auth token to be cleared
      expect(authenticationStorageService.getAuthToken().getValue()).toBeNull();
      // And to be redirected to the end session endpoint with id_token_hint
      expect(setLocationHrefSpy).toHaveBeenCalledWith(
        'https://auth.example.com/logout?client_id=test-client-id'
        + `&post_logout_redirect_uri=${encodeURIComponent('http://localhost:3000/')}&id_token_hint=id-token`
      );
    });
  });
});
