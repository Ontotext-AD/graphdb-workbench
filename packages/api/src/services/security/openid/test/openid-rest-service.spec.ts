import {OpenIdRestService} from '../openid-rest-service';
import {SecurityContextService} from '../../security-context.service';
import {OpenIdTokens} from '../../../../models/security/authentication/openid-auth-flow-models';
import {MissingOpenidConfiguration} from '../../errors/openid/missing-openid-configuration';
import {service} from '../../../../providers';
import {OpenidSecurityConfig, SecurityConfig} from '../../../../models/security';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';

describe('OpenIdRestService', () => {
  let openIdRestService: OpenIdRestService;
  let securityContextService: SecurityContextService;

  const mockOpenIdConfig = (overrides: Partial<OpenidSecurityConfig> = {}): OpenidSecurityConfig => {
    return new OpenidSecurityConfig({
      clientId: 'test-client-id',
      oidcJwksUri: 'https://auth.example.com/keys',
      oidcTokenEndpoint: 'https://auth.example.com/token',
      oracleDomain: 'test-domain',
      proxyOidc: false,
      ...overrides
    });
  };

  const mockSecurityConfig = (openidConfig: OpenidSecurityConfig): SecurityConfig => {
    const config = {} as SecurityConfig;
    config.openidSecurityConfig = openidConfig;
    return config;
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create real service instances
    securityContextService = service(SecurityContextService);

    openIdRestService = new OpenIdRestService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    TestUtil.restoreAllMocks();
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
  });

  describe('getJSONWebKeySet', () => {
    it('should fetch JWKS from the correct endpoint', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = {
        keys: [
          { kid: 'key-1' },
          { kid: 'key-2' }
        ]
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!)
          .setResponse(mockJWKS)
          .setStatus(200)
      );

      const result = await openIdRestService.getJSONWebKeySet();

      expect(result).toEqual(mockJWKS);

      // Verify the headers include Oracle domain
      const request = TestUtil.getRequest(config.openIdKeysUri!);
      expect(request?.headers).toBeDefined();
      expect((request?.headers as Record<string, string>)['X-OAuth-Identity-Domain-Name']).toBe('test-domain');
    });

    it('should include Oracle domain header when oracleDomain is configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: 'my-oracle-domain' });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = { keys: [{ kid: 'key-1' }] };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!)
          .setResponse(mockJWKS)
          .setStatus(200)
      );

      await openIdRestService.getJSONWebKeySet();

      const request = TestUtil.getRequest(config.openIdKeysUri!);
      expect(request?.headers).toBeDefined();
      expect((request?.headers as Record<string, string>)['X-OAuth-Identity-Domain-Name']).toBe('my-oracle-domain');
    });

    it('should not include Oracle domain header when oracleDomain is not configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: undefined });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = { keys: [{ kid: 'key-1' }] };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdKeysUri!)
          .setResponse(mockJWKS)
          .setStatus(200)
      );

      await openIdRestService.getJSONWebKeySet();

      const request = TestUtil.getRequest(config.openIdKeysUri!);
      expect(request?.headers).toBeDefined();
      expect((request?.headers as Record<string, string>)['X-OAuth-Identity-Domain-Name']).toBeUndefined();
    });

    it('should throw MissingOpenidConfiguration when config is missing', () => {
      // Don't set any security config - context will return undefined

      expect(() => openIdRestService.getJSONWebKeySet()).toThrow(MissingOpenidConfiguration);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token with correct parameters', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const refreshToken = 'test-refresh-token';
      const mockTokens: OpenIdTokens = {
        access_token: 'new-access-token',
        id_token: 'new-id-token',
        refresh_token: 'new-refresh-token'
      };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!)
          .setResponse(mockTokens)
          .setStatus(200)
      );

      const result = await openIdRestService.refreshToken(refreshToken);

      expect(result).toEqual(mockTokens);

      // Verify the request parameters
      const request = TestUtil.getRequest(config.openIdTokenUrl!);
      expect(request?.method).toBe('POST');
      expect((request?.headers as Record<string, string>)['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');

      const body = request?.body as URLSearchParams;
      expect(body.get('grant_type')).toBe('refresh_token');
      expect(body.get('client_id')).toBe('test-client-id');
      expect(body.get('refresh_token')).toBe(refreshToken);
    });

    it('should include Oracle domain header when configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: 'my-oracle-domain' });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!)
          .setResponse(mockTokens)
          .setStatus(200)
      );

      await openIdRestService.refreshToken('test-token');

      const request = TestUtil.getRequest(config.openIdTokenUrl!);
      expect(request?.headers).toBeDefined();
      expect((request?.headers as Record<string, string>)['X-OAuth-Identity-Domain-Name']).toBe('my-oracle-domain');
    });

    it('should throw MissingOpenidConfiguration when config is missing', () => {
      // Don't set any security config - context will return undefined

      expect(() => openIdRestService.refreshToken('test-token')).toThrow(MissingOpenidConfiguration);
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
        new ResponseMock(config.openIdTokenUrl!)
          .setResponse(mockTokens)
          .setStatus(200)
      );

      const result = await openIdRestService.getTokens(redirectUrl, code);

      expect(result).toEqual(mockTokens);

      // Verify the request parameters
      const request = TestUtil.getRequest(config.openIdTokenUrl!);
      expect(request?.method).toBe('POST');
      expect((request?.headers as Record<string, string>)['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');

      const body = request?.body as URLSearchParams;
      expect(body.get('grant_type')).toBe('authorization_code');
      expect(body.get('client_id')).toBe('test-client-id');
      expect(body.get('redirect_uri')).toBe(redirectUrl);
      expect(body.get('code')).toBe(code);
      expect(body.get('code_verifier')).toBeNull();
    });

    it('should include code_verifier when PKCE is used', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const redirectUrl = 'https://app.example.com/callback';
      const code = 'auth-code-123';
      const codeVerifier = 'code-verifier-456';
      const mockTokens: OpenIdTokens = { access_token: 'token' };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!)
          .setResponse(mockTokens)
          .setStatus(200)
      );

      const result = await openIdRestService.getTokens(redirectUrl, code, codeVerifier);

      expect(result).toEqual(mockTokens);

      // Verify the body contains code_verifier
      const request = TestUtil.getRequest(config.openIdTokenUrl!);
      const body = request?.body as URLSearchParams;
      expect(body.get('code_verifier')).toBe(codeVerifier);
    });

    it('should not include code_verifier when it is null', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!)
          .setResponse(mockTokens)
          .setStatus(200)
      );

      await openIdRestService.getTokens('https://app.example.com/callback', 'code', null);

      const request = TestUtil.getRequest(config.openIdTokenUrl!);
      const body = request?.body as URLSearchParams;
      expect(body.get('code_verifier')).toBeNull();
    });

    it('should not include code_verifier when it is undefined', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!)
          .setResponse(mockTokens)
          .setStatus(200)
      );

      await openIdRestService.getTokens('https://app.example.com/callback', 'code', undefined);

      const request = TestUtil.getRequest(config.openIdTokenUrl!);
      const body = request?.body as URLSearchParams;
      expect(body.get('code_verifier')).toBeNull();
    });

    it('should include Oracle domain header when configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: 'my-oracle-domain' });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      TestUtil.mockResponse(
        new ResponseMock(config.openIdTokenUrl!)
          .setResponse(mockTokens)
          .setStatus(200)
      );

      await openIdRestService.getTokens('https://app.example.com/callback', 'code');

      const request = TestUtil.getRequest(config.openIdTokenUrl!);
      expect(request?.headers).toBeDefined();
      expect((request?.headers as Record<string, string>)['X-OAuth-Identity-Domain-Name']).toBe('my-oracle-domain');
    });

    it('should throw MissingOpenidConfiguration when config is missing', () => {
      // Don't set any security config - context will return undefined

      expect(() =>
        openIdRestService.getTokens('https://app.example.com/callback', 'code')
      ).toThrow(MissingOpenidConfiguration);
    });
  });
});
