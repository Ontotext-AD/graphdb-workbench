import {OpenIdRestService} from '../openid-rest-service';
import {SecurityContextService} from '../../security-context.service';
import {OpenIdTokens} from '../../../../models/security/authentication';
import {MissingOpenidConfiguration} from '../errors/missing-openid-configuration';
import {service} from '../../../../providers';
import {OpenidSecurityConfig, SecurityConfig} from '../../../../models/security';

describe('OpenIdRestService', () => {
  let openIdRestService: OpenIdRestService;
  let securityContextService: SecurityContextService;

  const mockOpenIdConfig = (overrides: Partial<OpenidSecurityConfig> = {}): OpenidSecurityConfig => {
    return new OpenidSecurityConfig({
      clientId: 'test-client-id',
      openIdKeysUri: 'https://auth.example.com/keys',
      openIdTokenUrl: 'https://auth.example.com/token',
      oracleDomain: 'test-domain',
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

      // Mock the global fetch directly
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockJWKS,
        text: async () => JSON.stringify(mockJWKS),
      } as Response);

      const result = await openIdRestService.getJSONWebKeySet();

      expect(result).toEqual(mockJWKS);
      expect(fetch).toHaveBeenCalled();

      // Verify the headers include Oracle domain
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['X-OAuth-Identity-Domain-Name']).toBe('test-domain');
    });

    it('should include Oracle domain header when oracleDomain is configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: 'my-oracle-domain' });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = { keys: [{ kid: 'key-1' }] };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockJWKS,
      } as Response);

      await openIdRestService.getJSONWebKeySet();

      expect(fetch).toHaveBeenCalled();
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['X-OAuth-Identity-Domain-Name']).toBe('my-oracle-domain');
    });

    it('should not include Oracle domain header when oracleDomain is not configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: undefined });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockJWKS = { keys: [{ kid: 'key-1' }] };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockJWKS,
      } as Response);

      await openIdRestService.getJSONWebKeySet();

      expect(fetch).toHaveBeenCalled();
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['X-OAuth-Identity-Domain-Name']).toBeUndefined();
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

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockTokens,
      } as Response);

      const result = await openIdRestService.refreshToken(refreshToken);

      expect(result).toEqual(mockTokens);
      expect(fetch).toHaveBeenCalled();

      // Verify the request parameters
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');

      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get('grant_type')).toBe('refresh_token');
      expect(body.get('client_id')).toBe('test-client-id');
      expect(body.get('refresh_token')).toBe(refreshToken);
    });

    it('should include Oracle domain header when configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: 'my-oracle-domain' });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockTokens,
      } as Response);

      await openIdRestService.refreshToken('test-token');

      expect(fetch).toHaveBeenCalled();
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['X-OAuth-Identity-Domain-Name']).toBe('my-oracle-domain');
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

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockTokens,
      } as Response);

      const result = await openIdRestService.getTokens(redirectUrl, code);

      expect(result).toEqual(mockTokens);
      expect(fetch).toHaveBeenCalled();

      // Verify the request parameters
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded; charset=utf-8');

      const body = fetchCall[1].body as URLSearchParams;
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

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockTokens,
      } as Response);

      const result = await openIdRestService.getTokens(redirectUrl, code, codeVerifier);

      expect(result).toEqual(mockTokens);

      // Verify the body contains code_verifier
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get('code_verifier')).toBe(codeVerifier);
    });

    it('should not include code_verifier when it is null', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockTokens,
      } as Response);

      await openIdRestService.getTokens('https://app.example.com/callback', 'code', null);

      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get('code_verifier')).toBeNull();
    });

    it('should not include code_verifier when it is undefined', async () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockTokens,
      } as Response);

      await openIdRestService.getTokens('https://app.example.com/callback', 'code', undefined);

      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get('code_verifier')).toBeNull();
    });

    it('should include Oracle domain header when configured', async () => {
      const config = mockOpenIdConfig({ oracleDomain: 'my-oracle-domain' });
      const securityConfig = mockSecurityConfig(config);
      securityContextService.updateSecurityConfig(securityConfig);

      const mockTokens: OpenIdTokens = { access_token: 'token' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (name: string) => name === 'Content-Type' ? 'application/json' : undefined },
        json: async () => mockTokens,
      } as Response);

      await openIdRestService.getTokens('https://app.example.com/callback', 'code');

      expect(fetch).toHaveBeenCalled();
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['X-OAuth-Identity-Domain-Name']).toBe('my-oracle-domain');
    });

    it('should throw MissingOpenidConfiguration when config is missing', () => {
      // Don't set any security config - context will return undefined

      expect(() =>
        openIdRestService.getTokens('https://app.example.com/callback', 'code')
      ).toThrow(MissingOpenidConfiguration);
    });
  });
});
