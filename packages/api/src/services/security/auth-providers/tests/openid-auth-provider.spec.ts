import {OpenidAuthProvider} from '../openid-auth-provider';
import {
  AuthenticationService,
  AuthenticationStorageService,
  OpenidStorageService,
  SecurityContextService,
  SecurityService
} from '../../../../services/security';
import {OpenIdService} from '../../openid';
import {OpenidTokenUtils} from '../../openid/openid-token-utils';
import {ServiceProvider} from '../../../../providers';
import {LoggerProvider} from '../../../logging/logger-provider';
import {TestUtil} from '../../../utils/test/test-util';
import {AuthenticatedUser, OpenidSecurityConfig, SecurityConfig} from '../../../../models/security';
import {OpenIdAuthFlowType} from '../../../../models/security/authentication';
import {MissingOpenidConfiguration} from '../../openid/errors/missing-openid-configuration';
import {InvalidOpenidAuthFlow} from '../../openid/errors/invalid-openid-auth-flow';
import {ProviderResponseMocks} from './provider-response-mocks';
import {ResponseMock} from '../../../http/test/response-mock';
import {WindowService} from '../../../window';

describe('OpenidAuthProvider', () => {
  let provider: OpenidAuthProvider;
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
  const createSecurityConfig = (openidConfig?: OpenidSecurityConfig): SecurityConfig => {
    const config = {
      enabled: true,
      userLoggedIn: false,
      passwordLoginEnabled: false,
      openIdEnabled: true
    } as SecurityConfig;
    if (openidConfig) {
      config.openidSecurityConfig = openidConfig;
    }
    return config;
  };

  /**
   * Sets up the security configuration in the context service.
   */
  const setupSecurityConfig = (openidConfig?: OpenidSecurityConfig): void => {
    const securityConfig = createSecurityConfig(openidConfig);
    securityContextService.updateSecurityConfig(securityConfig);
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
    securityContextService.updateAuthToken(undefined as unknown as string);
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    authenticationStorageService.clearAuthToken();
    openidStorageService.clearReturnUrl();

    // Mock window.singleSpa.navigateToUrl
    if (!window.singleSpa) {
      window.singleSpa = {} as never;
    }
    window.singleSpa.navigateToUrl = jest.fn();

    // Create provider instance
    provider = new OpenidAuthProvider();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should set up configuration listener', () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);

      // Trigger configuration change
      const newConfig = createSecurityConfig(openidConfig);
      securityContextService.updateSecurityConfig(newConfig);

      // Provider should have received the config
      expect(provider['openIdSecurityConfig']).toEqual(openidConfig);
    });
  });

  describe('initialize', () => {
    let initializeOpenIdSpy: jest.SpyInstance;
    let getAuthenticatedUserSpy: jest.SpyInstance;
    let updateAuthenticatedUserSpy: jest.SpyInstance;
    let authHeaderGraphDBSpy: jest.SpyInstance;

    beforeEach(() => {
      initializeOpenIdSpy = jest.spyOn(openIdService, 'initializeOpenId');
      getAuthenticatedUserSpy = jest.spyOn(securityService, 'getAuthenticatedUser');
      updateAuthenticatedUserSpy = jest.spyOn(securityContextService, 'updateAuthenticatedUser');
      authHeaderGraphDBSpy = jest.spyOn(tokenUtils, 'authHeaderGraphDB');
    });

    describe('when OpenID configuration is missing', () => {
      it('should throw MissingOpenidConfiguration error', async () => {
        setupSecurityConfig(); // No OpenID config

        await expect(provider.initialize()).rejects.toThrow(MissingOpenidConfiguration);
        expect(initializeOpenIdSpy).not.toHaveBeenCalled();
      });
    });

    describe('when user is successfully authenticated', () => {
      beforeEach(() => {
        const openidConfig = createOpenIdConfig();
        setupSecurityConfig(openidConfig);

        initializeOpenIdSpy.mockResolvedValue(true);
        authHeaderGraphDBSpy.mockReturnValue('Bearer test-token');
        TestUtil.mockResponse(
          new ResponseMock('rest/security/authenticated-user')
            .setResponse(ProviderResponseMocks.authenticatedUserResponse)
        );
      });

      it('should initialize OpenID and set auth token', async () => {
        const result = await provider.initialize();

        expect(result).toBe(true);
        expect(initializeOpenIdSpy).toHaveBeenCalled();
        expect(loggerDebugSpy).toHaveBeenCalledWith('OpenID: authentication initialized');
        expect(authenticationStorageService.getAuthToken().getValue()).toBe('Bearer test-token');
      });

      it('should load and set authenticated user', async () => {
        await provider.initialize();

        expect(getAuthenticatedUserSpy).toHaveBeenCalled();
        expect(updateAuthenticatedUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'testUser'
          })
        );
      });

      it('should navigate to return URL if present', async () => {
        openidStorageService.setReturnUrl('/repositories');

        await provider.initialize();

        expect(window.singleSpa.navigateToUrl).toHaveBeenCalledWith('/repositories');
        expect(openidStorageService.getReturnUrl().getValue()).toBeNull();
      });

      it('should not navigate if no return URL', async () => {
        await provider.initialize();

        expect(window.singleSpa.navigateToUrl).not.toHaveBeenCalled();
      });

      it('should handle error when loading authenticated user fails', async () => {
        getAuthenticatedUserSpy.mockRejectedValue(new Error('User load failed'));

        const result = await provider.initialize();

        expect(result).toBe(true);
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          'Could not load authenticated user',
          expect.any(Error)
        );
        expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
      });
    });

    describe('when user is not authenticated', () => {
      beforeEach(() => {
        const openidConfig = createOpenIdConfig();
        setupSecurityConfig(openidConfig);
        initializeOpenIdSpy.mockResolvedValue(false);
      });

      it('should return false', async () => {
        const result = await provider.initialize();

        expect(result).toBe(false);
        expect(authenticationStorageService.getAuthToken().getValue()).toBeNull();
      });

      it('should not load authenticated user', async () => {
        await provider.initialize();

        expect(getAuthenticatedUserSpy).not.toHaveBeenCalled();
        expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
      });
    });

    describe('when OpenID initialization fails', () => {
      let clearAuthenticationSpy: jest.SpyInstance;

      beforeEach(() => {
        const openidConfig = createOpenIdConfig();
        setupSecurityConfig(openidConfig);
        clearAuthenticationSpy = jest.spyOn(openIdService, 'clearAuthentication');
      });

      it('should handle errors and clear authentication', async () => {
        const error = new Error('Init failed');
        initializeOpenIdSpy.mockRejectedValue(error);

        const result = await provider.initialize();

        expect(result).toBe(false);
        expect(loggerDebugSpy).toHaveBeenCalledWith('OpenID: not logged or login error');
        expect(loggerErrorSpy).toHaveBeenCalledWith('Could not initialize OpenID authentication', error);
        expect(authenticationStorageService.getAuthToken().getValue()).toBeNull();
        expect(clearAuthenticationSpy).toHaveBeenCalled();
      });
    });
  });

  describe('login', () => {
    let setupCodeFlowSpy: jest.SpyInstance;
    let setupCodeNoPkceFlowSpy: jest.SpyInstance;
    let setupImplicitFlowSpy: jest.SpyInstance;

    beforeEach(() => {
      setupCodeFlowSpy = jest.spyOn(openIdService, 'setupCodeFlow');
      setupCodeNoPkceFlowSpy = jest.spyOn(openIdService, 'setupCodeNoPkceFlow');
      setupImplicitFlowSpy = jest.spyOn(openIdService, 'setupImplicitFlow');

      // Mock window.location.origin and crypto
      jest.spyOn(WindowService, 'getWindow').mockReturnValue({
        location: {
          origin: 'http://localhost:3000',
          pathname: '/home'
        },
        crypto: {
          getRandomValues: jest.fn((array: Uint32Array) => {
            for (let i = 0; i < array.length; i++) {
              array[i] = Math.floor(Math.random() * 0xffffffff);
            }
            return array;
          })
        }
      } as unknown as Window);
    });

    describe('when OpenID configuration is missing', () => {
      it('should throw MissingOpenidConfiguration error', async () => {
        setupSecurityConfig(); // No OpenID config

        expect(() => provider.login()).toThrow(MissingOpenidConfiguration);
        expect(setupCodeFlowSpy).not.toHaveBeenCalled();
      });
    });

    describe('with authorization code flow', () => {
      beforeEach(() => {
        const openidConfig = createOpenIdConfig({authFlow: OpenIdAuthFlowType.CODE});
        setupSecurityConfig(openidConfig);
      });

      it('should initiate code flow with state and return URL', async () => {
        const promise = provider.login();

        // Should not resolve as user gets redirected
        expect(setupCodeFlowSpy).toHaveBeenCalledWith(
          expect.any(String),
          'http://localhost:3000/login'
        );
        expect(setupCodeFlowSpy.mock.calls[0][0]).toHaveLength(56); // state length (28 * 2 hex chars)

        // Verify promise never resolves
        const settled = await Promise.race([
          promise.then(() => 'resolved'),
          new Promise((resolve) => setTimeout(() => resolve('timeout'), 10))
        ]);
        expect(settled).toBe('timeout');
      });
    });

    describe('with authorization code flow without PKCE', () => {
      beforeEach(() => {
        const openidConfig = createOpenIdConfig({authFlow: OpenIdAuthFlowType.CODE_NO_PKCE});
        setupSecurityConfig(openidConfig);
      });

      it('should initiate code flow without PKCE', async () => {
        provider.login();

        expect(setupCodeNoPkceFlowSpy).toHaveBeenCalledWith(
          expect.any(String),
          'http://localhost:3000/login'
        );
        expect(setupCodeNoPkceFlowSpy.mock.calls[0][0]).toHaveLength(56);
      });
    });

    describe('with implicit flow', () => {
      beforeEach(() => {
        const openidConfig = createOpenIdConfig({authFlow: OpenIdAuthFlowType.IMPLICIT});
        setupSecurityConfig(openidConfig);
      });

      it('should initiate implicit flow', async () => {
        provider.login();

        expect(setupImplicitFlowSpy).toHaveBeenCalledWith(
          expect.any(String),
          'http://localhost:3000/login'
        );
        expect(setupImplicitFlowSpy.mock.calls[0][0]).toHaveLength(56);
      });
    });

    describe('with unknown flow type', () => {
      beforeEach(() => {
        const openidConfig = createOpenIdConfig({authFlow: 'unknown' as unknown as OpenIdAuthFlowType});
        setupSecurityConfig(openidConfig);
      });

      it('should throw InvalidOpenidAuthFlow error', async () => {
        expect(() => provider.login()).toThrow(InvalidOpenidAuthFlow);
        expect(loggerDebugSpy).toHaveBeenCalledWith(
          'OpenID: Invalid OpenID authentication flow: unknown'
        );
      });
    });
  });

  describe('logout', () => {
    let logoutSpy: jest.SpyInstance;

    beforeEach(() => {
      logoutSpy = jest.spyOn(openIdService, 'logout');
    });

    it('should call openIdService.logout', async () => {
      await provider.logout();

      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should resolve immediately', async () => {
      const result = await provider.logout();

      expect(result).toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(() => {
      const openidConfig = createOpenIdConfig();
      const securityConfig = createSecurityConfig(openidConfig);
      securityContextService.updateSecurityConfig(securityConfig);
    });

    it('should return true when auth token exists and security is enabled', () => {
      authenticationStorageService.setAuthToken('Bearer test-token');

      expect(provider.isAuthenticated()).toBe(true);
    });

    it('should return false when auth token is null and security is enabled', () => {
      authenticationStorageService.clearAuthToken();

      expect(provider.isAuthenticated()).toBe(false);
    });

    it('should return true when security is not enabled', () => {
      const securityConfig = createSecurityConfig();
      securityConfig.enabled = false;
      securityContextService.updateSecurityConfig(securityConfig);
      jest.spyOn(authenticationService, 'isSecurityEnabled').mockReturnValue(false);

      expect(provider.isAuthenticated()).toBe(true);
    });
  });

  describe('type property', () => {
    it('should have type OPENID', () => {
      expect(provider.type).toBe('OPENID');
    });
  });

  describe('configuration listener', () => {
    it('should update internal config when security config changes', () => {
      const firstConfig = createOpenIdConfig({clientId: 'client-1'});
      setupSecurityConfig(firstConfig);

      expect(provider['openIdSecurityConfig']?.clientId).toBe('client-1');

      const secondConfig = createOpenIdConfig({clientId: 'client-2'});
      setupSecurityConfig(secondConfig);

      expect(provider['openIdSecurityConfig']?.clientId).toBe('client-2');
    });

    it('should handle null security config', () => {
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);

      expect(provider['openIdSecurityConfig']).toBeDefined();

      securityContextService.updateSecurityConfig(null as unknown as SecurityConfig);

      // Config should not be cleared if null is passed (listener checks for truthy)
      expect(provider['openIdSecurityConfig']).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete authentication flow', async () => {
      // Setup
      const openidConfig = createOpenIdConfig();
      setupSecurityConfig(openidConfig);
      jest.spyOn(openIdService, 'initializeOpenId').mockResolvedValue(true);
      jest.spyOn(tokenUtils, 'authHeaderGraphDB').mockReturnValue('Bearer test-token');
      TestUtil.mockResponse(
        new ResponseMock('rest/security/authenticated-user')
          .setResponse(ProviderResponseMocks.authenticatedUserResponse)
      );

      // Initialize
      const isLoggedIn = await provider.initialize();

      // Verify complete flow
      expect(isLoggedIn).toBe(true);
      expect(provider.isAuthenticated()).toBe(true);
      expect(authenticationStorageService.getAuthToken().getValue()).toBe('Bearer test-token');
      expect(securityContextService.getAuthenticatedUser()?.username).toBe('testUser');
    });

    it('should handle complete logout flow', async () => {
      // Setup authenticated state
      authenticationStorageService.setAuthToken('Bearer test-token');
      const authenticatedUser = ProviderResponseMocks.authenticatedUserResponse as unknown as AuthenticatedUser;
      securityContextService.updateAuthenticatedUser(authenticatedUser);

      // Logout
      jest.spyOn(openIdService, 'logout').mockImplementation(() => {
        authenticationStorageService.clearAuthToken();
      });

      await provider.logout();

      // Verify cleanup
      expect(openIdService.logout).toHaveBeenCalled();
    });
  });
});
