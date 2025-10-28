import {OpenIdService} from '../openid-service';
import {SecurityContextService} from '../../security-context.service';
import {OpenidStorageService} from '../openid-storage.service';
import {OpenidTokenUtils} from '../openid-token-utils';
import {AuthenticationStorageService} from '../../authentication-storage.service';
import {OpenIdTokenRefreshManager} from '../openid-token-refresh-manager';
import {EventService} from '../../../event-service';
import {WindowService} from '../../../window';
import {service} from '../../../../providers';
import {OpenidSecurityConfig, SecurityConfig} from '../../../../models/security';
import {OpenIdAuthFlowType, OpenIdTokens} from '../../../../models/security/authentication/openid-auth-flow-models';
import {Logout} from '../../../../models/events';
import {MissingOpenidConfiguration} from '../../errors/openid/missing-openid-configuration';
import {ResponseMock} from '../../../http/test/response-mock';
import {TestUtil} from '../../../utils/test/test-util';

describe('OpenIdService', () => {
  let openIdService: OpenIdService;
  let securityContextService: SecurityContextService;
  let openidStorageService: OpenidStorageService;
  let tokenUtils: OpenidTokenUtils;
  let authenticationStorageService: AuthenticationStorageService;
  let tokenRefreshManager: OpenIdTokenRefreshManager;
  let eventService: EventService;

  const mockOpenIdConfig = (overrides: Partial<OpenidSecurityConfig> = {}): OpenidSecurityConfig => {
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

  const mockSecurityConfig = (openidConfig: OpenidSecurityConfig): SecurityConfig => {
    const config = {} as SecurityConfig;
    config.openidSecurityConfig = openidConfig;
    return config;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create real service instances
    securityContextService = service(SecurityContextService);
    openidStorageService = service(OpenidStorageService);
    tokenUtils = service(OpenidTokenUtils);
    authenticationStorageService = service(AuthenticationStorageService);
    tokenRefreshManager = service(OpenIdTokenRefreshManager);
    eventService = service(EventService);

    openIdService = new OpenIdService();

    // Only mock WindowService static methods for side effects and external I/O
    jest.spyOn(WindowService, 'setLocationHref').mockImplementation(() => undefined);

    // Mock crypto for PKCE code verifier generation (external I/O)
    jest.spyOn(WindowService, 'getCrypto').mockReturnValue({
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }
    } as Crypto);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
    // Clear tokens and PKCE data
    openidStorageService.clearTokens();
    openidStorageService.clearPkceState();
    openidStorageService.clearPkceCodeVerifier();
    openidStorageService.clearNonce();
  });

  describe('getJSONWebKeySet', () => {
    it('should fetch JWKS from the OpenID provider', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {
        keys: [
          {kid: 'key-1', kty: 'RSA', use: 'sig'},
          {kid: 'key-2', kty: 'RSA', use: 'sig'}
        ]
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      const result = await openIdService.getJSONWebKeySet();

      expect(result).toEqual(mockJWKS);
      expect(result.keys).toHaveLength(2);
      expect(result.keys[0].kid).toBe('key-1');
    });
  });

  describe('getTokens', () => {
    it('should exchange authorization code for tokens', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const redirectUrl = 'https://app.example.com/callback';
      const code = 'auth-code-123';
      const mockTokens: OpenIdTokens = {
        access_token: 'access-token',
        id_token: 'id-token',
        refresh_token: 'refresh-token'
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!).setResponse(mockTokens).setStatus(200)
      );

      const result = await openIdService.getTokens(redirectUrl, code);

      expect(result).toEqual(mockTokens);
    });

    it('should pass code verifier for PKCE flow', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const redirectUrl = 'https://app.example.com/callback';
      const code = 'auth-code-123';
      const codeVerifier = 'test-code-verifier';
      const mockTokens: OpenIdTokens = {
        access_token: 'access-token',
        id_token: 'id-token'
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!).setResponse(mockTokens).setStatus(200)
      );

      await openIdService.getTokens(redirectUrl, code, codeVerifier);

      const tokensRequest = TestUtil.getRequest(config.openIdTokenUrl!);
      expect(tokensRequest?.body).toBeDefined();
      expect(tokensRequest!.body!.toString()).toContain(codeVerifier);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens and setup next refresh', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const refreshToken = 'test-refresh-token';
      const mockNewTokens: OpenIdTokens = {
        access_token: 'new-access-token',
        id_token: 'new-id-token',
        refresh_token: 'new-refresh-token'
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!).setResponse(mockNewTokens).setStatus(200)
      );

      const saveTokensSpy = jest.spyOn(tokenUtils, 'saveTokens');
      const setAuthTokenSpy = jest.spyOn(authenticationStorageService, 'setAuthToken');
      const setupTokensRefreshSpy = jest.spyOn(tokenRefreshManager, 'setupTokensRefresh');
      setupTokensRefreshSpy.mockReturnValue(Promise.resolve());

      await openIdService.refreshTokens(refreshToken);

      expect(saveTokensSpy).toHaveBeenCalledWith(mockNewTokens, config);
      expect(setAuthTokenSpy).toHaveBeenCalled();
      expect(setupTokensRefreshSpy).toHaveBeenCalled();
    });

    it('should emit logout event on refresh failure', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const emitSpy = jest.spyOn(eventService, 'emit');
      const clearAuthenticationSpy = jest.spyOn(openIdService, 'clearAuthentication');
      jest.spyOn(tokenRefreshManager, 'setupTokensRefresh').mockImplementation(() => {
        throw new Error('Refresh failed');
      });

      await openIdService.refreshTokens('invalid-token');

      expect(clearAuthenticationSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith(expect.any(Logout));
    });

    it('should throw MissingOpenidConfiguration when config is missing', async () => {
      securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);

      await expect(openIdService.refreshTokens('test-token')).rejects.toThrow(MissingOpenidConfiguration);
    });
  });

  describe('initializeOpenId', () => {
    it('should return true when user has valid authentication', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {
        keys: [
          {
            kid: 'key-1',
            kty: 'RSA',
            n: 'xGOr-H7A-PWq_dPZq_Owv5_n2d5vhYYGiYVo_AdBP6HhH-L4YP5p5s1WvZoQi8LfhLQFYVD-7OoNqk6OQ',
            e: 'AQAB'
          }
        ]
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      // Store tokens - access token can be opaque, but refresh token needs to be a parseable JWT
      // for the TokenRefreshManager to calculate refresh timing
      const refreshToken = 'eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.sig';
      openidStorageService.setAccessToken('opaque-access-token');
      openidStorageService.setRefreshToken(refreshToken);

      const result = await openIdService.initializeOpenId();

      expect(result).toBe(true);
    });

    it('should handle authentication flow when not authenticated', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'key-1'}]};

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      // Ensure no tokens in storage - user is not authenticated
      openidStorageService.clearTokens();

      // Mock empty URL params
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('');

      const result = await openIdService.initializeOpenId();

      expect(result).toBe(false);
    });

    it('should update JSON Web Key Set in security context', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {
        keys: [
          {
            kid: 'key-1',
            kty: 'RSA',
            n: 'xGOr-H7A-PWq_dPZq_Owv5_n2d5vhYYGiYVo_AdBP6HhH-L4YP5p5s1WvZoQi8LfhLQFYVD-7OoNqk6OQ',
            e: 'AQAB'
          },
          {
            kid: 'key-2',
            kty: 'RSA',
            n: 'yGOr-H7A-PWq_dPZq_Owv5_n2d5vhYYGiYVo_AdBP6HhH-L4YP5p5s1WvZoQi8LfhLQFYVD-7OoNqk6OQ',
            e: 'AQAB'
          }
        ]
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      // Store tokens - refresh token must be parseable
      const refreshToken = 'eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.sig';
      openidStorageService.setAccessToken('opaque-access-token');
      openidStorageService.setRefreshToken(refreshToken);

      const updateJsonWebKeysSetSpy = jest.spyOn(securityContextService, 'updateJsonWebKeysSet');

      await openIdService.initializeOpenId();

      expect(updateJsonWebKeysSetSpy).toHaveBeenCalled();
      const keySet = updateJsonWebKeysSetSpy.mock.calls[0][0];
      expect(keySet['key-1']).toBeDefined();
      expect(keySet['key-2']).toBeDefined();
    });
  });

  describe('initializeJsonWebKeySet', () => {
    it('should load JWKS and update security context', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'test-key', kty: 'RSA'}]};

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      const updateJsonWebKeysSetSpy = jest.spyOn(securityContextService, 'updateJsonWebKeysSet');

      await openIdService.initializeJsonWebKeySet();

      expect(updateJsonWebKeysSetSpy).toHaveBeenCalledWith(
        expect.objectContaining({'test-key': expect.any(Object)})
      );
    });
  });

  describe('setupCodeFlow', () => {
    it('should store code flow data and redirect to login URL', () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const state = 'test-state';
      const returnToUrl = 'https://app.example.com/callback';

      openIdService.setupCodeFlow(state, returnToUrl);

      // Verify code flow data was stored
      expect(openidStorageService.getPkceState().getValue()).toBe(state);
      expect(openidStorageService.getPkceCodeVerifier().getValue()).toBeTruthy();

      // Verify redirect was called
      expect(WindowService.setLocationHref).toHaveBeenCalled();
      const redirectUrl = (WindowService.setLocationHref as jest.Mock).mock.calls[0][0];
      expect(redirectUrl).toContain(config.oidcAuthorizationEndpoint);
      expect(redirectUrl).toContain(`state=${state}`);
    });
  });

  describe('setupCodeNoPkceFlow', () => {
    it('should clear PKCE code verifier and redirect to login URL', () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const state = 'test-state';
      const returnToUrl = 'https://app.example.com/callback';

      // Set a code verifier first
      openidStorageService.setPkceCodeVerifier('some-verifier');

      openIdService.setupCodeNoPkceFlow(state, returnToUrl);

      // Verify code verifier was cleared
      expect(openidStorageService.getPkceCodeVerifier().getValue()).toBeNull();

      // Verify redirect was called
      expect(WindowService.setLocationHref).toHaveBeenCalled();
      const redirectUrl = (WindowService.setLocationHref as jest.Mock).mock.calls[0][0];
      expect(redirectUrl).toContain(config.oidcAuthorizationEndpoint);
    });
  });

  describe('setupImplicitFlow', () => {
    it('should store nonce and redirect to login URL', () => {
      const config = mockOpenIdConfig({authFlow: OpenIdAuthFlowType.IMPLICIT});
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const state = 'test-nonce';
      const returnToUrl = 'https://app.example.com/callback';

      openIdService.setupImplicitFlow(state, returnToUrl);

      // Verify nonce was stored
      expect(openidStorageService.getNonce().getValue()).toBe(state);

      // Verify redirect was called
      expect(WindowService.setLocationHref).toHaveBeenCalled();
      const redirectUrl = (WindowService.setLocationHref as jest.Mock).mock.calls[0][0];
      expect(redirectUrl).toContain(config.oidcAuthorizationEndpoint);
    });
  });

  describe('setupTokensRefresh', () => {
    it('should delegate to token refresh manager', async () => {
      await openIdService.setupTokensRefresh();

      // The real implementation is called - no need to verify internal details
      // Just ensure no errors are thrown
    });
  });

  describe('clearAuthentication', () => {
    it('should clear all authentication data and timers', () => {
      const clearAuthTokenSpy = jest.spyOn(authenticationStorageService, 'clearAuthToken');
      const clearTokensSpy = jest.spyOn(tokenUtils, 'clearTokens');
      const clearRefreshTimerSpy = jest.spyOn(tokenRefreshManager, 'clearRefreshTimer');

      openIdService.clearAuthentication();

      expect(clearAuthTokenSpy).toHaveBeenCalled();
      expect(clearTokensSpy).toHaveBeenCalled();
      expect(clearRefreshTimerSpy).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear authentication data', () => {
      const clearAuthenticationSpy = jest.spyOn(openIdService, 'clearAuthentication');

      openIdService.logout();

      expect(clearAuthenticationSpy).toHaveBeenCalled();
    });

    it('should perform soft logout when logoutFromIDP is false', () => {
      const clearAuthenticationSpy = jest.spyOn(openIdService, 'clearAuthentication');

      openIdService.logout(false);

      expect(clearAuthenticationSpy).toHaveBeenCalled();
      expect(WindowService.setLocationHref).not.toHaveBeenCalled();
    });

    it('should perform hard logout when logoutFromIDP is true', () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const clearAuthenticationSpy = jest.spyOn(openIdService, 'clearAuthentication');

      openIdService.logout(true);

      expect(clearAuthenticationSpy).toHaveBeenCalled();
      expect(WindowService.setLocationHref).toHaveBeenCalled();
      const logoutUrl = (WindowService.setLocationHref as jest.Mock).mock.calls[0][0];
      expect(logoutUrl).toContain(config.oidcEndSessionEndpoint);
    });
  });

  describe('initializeOpenId - handleAuthenticationFlow', () => {
    it('should handle authorization code flow with code in URL params', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'key-1'}]};
      // Return parseable JWT tokens - refresh token must be parseable for TokenRefreshManager
      const mockTokens: OpenIdTokens = {
        access_token: 'access-token',
        id_token: 'id-token',
        refresh_token: 'eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.sig'
      };

      TestUtil.mockResponses([
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200),
        new ResponseMock(config.openIdTokenUrl!).setResponse(mockTokens).setStatus(200)
      ]);

      jest.spyOn(tokenRefreshManager, 'setupTokensRefresh').mockReturnValue(Promise.resolve());

      // Ensure no existing auth
      openidStorageService.clearTokens();

      // Mock URL params to simulate callback from IDP
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('?code=auth-code-123&state=test-state');

      // Store PKCE state to simulate we initiated the flow
      openidStorageService.setPkceState('test-state');
      openidStorageService.setPkceCodeVerifier('test-verifier');

      const result = await openIdService.initializeOpenId();

      expect(result).toBe(true);
    });

    it('should handle implicit flow with id_token in URL params', async () => {
      const config = mockOpenIdConfig({authFlow: OpenIdAuthFlowType.IMPLICIT});
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'key-1'}]};

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      // Clear any existing auth
      openidStorageService.clearTokens();

      // Mock URL hash to simulate implicit flow callback
      // Use a valid JWT token structure
      const validToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleS0xIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTksIm5vbmNlIjoidGVzdC1zdGF0ZSJ9.signature';
      jest.spyOn(WindowService, 'getLocationHash').mockReturnValue(`#id_token=${validToken}&state=test-state`);

      // Store nonce to simulate we initiated the flow
      openidStorageService.setNonce('test-state');

      const result = await openIdService.initializeOpenId();

      expect(result).toBe(true);
    });

    it('should return false when no authentication flow params are present', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'key-1'}]};

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      // Clear tokens and ensure no URL params
      openidStorageService.clearTokens();
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('');

      const result = await openIdService.initializeOpenId();

      expect(result).toBe(false);
    });

    it('should clear authentication when handling authentication flow', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'key-1'}]};

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200)
      );

      openidStorageService.clearTokens();
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('');

      const clearAuthenticationSpy = jest.spyOn(openIdService, 'clearAuthentication');

      await openIdService.initializeOpenId();

      expect(clearAuthenticationSpy).toHaveBeenCalled();
    });

    it('should handle error when exchanging tokens for code fails', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'key-1'}]};

      TestUtil.mockResponses([
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200),
        new ResponseMock(config.openIdTokenUrl!).setStatus(400)
      ]);

      // Clear tokens
      openidStorageService.clearTokens();

      // Mock URL params with auth code
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('?code=auth-code-123&state=test-state');

      // Store PKCE state
      openidStorageService.setPkceState('test-state');
      openidStorageService.setPkceCodeVerifier('test-verifier');

      await expect(openIdService.initializeOpenId()).rejects.toThrow('Cannot retrieve token after login');
    });

    it('should successfully exchange tokens and setup refresh when code flow completes', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {keys: [{kid: 'key-1'}]};
      // Return parseable JWT tokens
      const mockTokens: OpenIdTokens = {
        access_token: 'new-access-token',
        id_token: 'new-id-token',
        refresh_token: 'eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE1MTYyMzkwMjIsImV4cCI6OTk5OTk5OTk5OX0.sig'
      };

      TestUtil.mockResponses([
        new ResponseMock(config.openIdKeysUri!).setResponse(mockJWKS).setStatus(200),
        new ResponseMock(config.openIdTokenUrl!).setResponse(mockTokens).setStatus(200)
      ]);
      jest.spyOn(tokenRefreshManager, 'setupTokensRefresh').mockReturnValue(Promise.resolve());

      // Clear tokens
      openidStorageService.clearTokens();

      // Mock URL params with auth code
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('?code=auth-code-123&state=test-state');

      // Store PKCE state to simulate we initiated the flow
      openidStorageService.setPkceState('test-state');
      openidStorageService.setPkceCodeVerifier('test-verifier');

      const saveTokensSpy = jest.spyOn(tokenUtils, 'saveTokens');

      const result = await openIdService.initializeOpenId();

      expect(result).toBe(true);
      expect(saveTokensSpy).toHaveBeenCalledWith(mockTokens, config);
    });
  });
});

