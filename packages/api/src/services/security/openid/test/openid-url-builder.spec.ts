import {OpenIdUrlBuilder} from '../openid-url-builder';
import {SecurityContextService} from '../../security-context.service';
import {SecurityConfig} from '../../../../models/security';
import {OpenIdAuthFlowType} from '../../../../models/security/authentication/openid-auth-flow-models';
import {OpenIdError} from '../../errors/openid/openid-error';
import {ServiceProvider} from '../../../../providers';
import {OpenidSecurityConfig} from '../../../../models/security';

describe('OpenIdUrlBuilder', () => {
  let openIdUrlBuilder: OpenIdUrlBuilder;
  let securityContextService: SecurityContextService;

  const mockOpenIdConfig = (overrides: Partial<OpenidSecurityConfig> = {}): OpenidSecurityConfig => {
    return new OpenidSecurityConfig({
      clientId: 'test-client-id',
      oidcAuthorizationEndpoint: 'https://auth.example.com/authorize',
      oidcEndSessionEndpoint: 'https://auth.example.com/logout',
      authFlow: OpenIdAuthFlowType.CODE,
      oidcScopesSupported: ['openid', 'offline_access'],
      ...overrides
    });
  };

  const mockSecurityConfig = (openidConfig: OpenidSecurityConfig): SecurityConfig => {
    const config = {} as SecurityConfig;
    config.openidSecurityConfig = openidConfig;
    return config;
  };

  beforeEach(() => {
    openIdUrlBuilder = new OpenIdUrlBuilder();
    securityContextService = ServiceProvider.get(SecurityContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildLoginUrl', () => {
    it('should build login URL with PKCE flow (CODE)', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.CODE
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('https://auth.example.com/authorize?');
      expect(result).toContain('response_type=code');
      expect(result).toContain('scope=openid%20offline_access');
      expect(result).toContain('client_id=test-client-id');
      expect(result).toContain(`redirect_uri=${encodeURIComponent(redirectUrl)}`);
      expect(result).toContain(`state=${encodeURIComponent(state)}`);
      expect(result).toContain(`code_challenge=${encodeURIComponent(codeChallenge)}`);
      expect(result).toContain('code_challenge_method=S256');
    });

    it('should build login URL with CODE_NO_PKCE flow', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.CODE_NO_PKCE,
        oidcScopesSupported: ['openid']
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('https://auth.example.com/authorize?');
      expect(result).toContain('response_type=code');
      expect(result).toContain('scope=openid');
      expect(result).toContain('client_id=test-client-id');
      expect(result).toContain(`redirect_uri=${encodeURIComponent(redirectUrl)}`);
      // CODE_NO_PKCE should not include PKCE parameters
      expect(result).not.toContain('code_challenge');
      expect(result).not.toContain('code_challenge_method');
    });

    it('should build login URL with IMPLICIT flow', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.IMPLICIT,
        oidcScopesSupported: ['openid']
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('https://auth.example.com/authorize?');
      expect(result).toContain('response_type=token%20id_token');
      expect(result).toContain('scope=openid');
      expect(result).toContain('client_id=test-client-id');
      expect(result).toContain(`redirect_uri=${encodeURIComponent(redirectUrl)}`);
      expect(result).toContain(`nonce=${encodeURIComponent(state)}`);
      // IMPLICIT should not include PKCE parameters
      expect(result).not.toContain('code_challenge');
    });

    it('should include Oracle domain parameter when configured', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.CODE,
        oracleDomain: 'oracle-domain-123'
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('domain=oracle-domain-123');
    });

    it('should include extra scopes when configured', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.CODE,
        extraScopes: 'extra_scope'
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('extra_scope');
    });

    it('should include additional authorize parameters when configured', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.CODE,
        authorizeParameters: 'param1=value1&param2=value2'
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('param1=value1&param2=value2');
    });

    it('should properly encode special characters in parameters', () => {
      const config = mockOpenIdConfig({
        clientId: 'client with spaces',
        authFlow: OpenIdAuthFlowType.CODE
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'state/with/slashes';
      const codeChallenge = 'challenge+with+plus';
      const redirectUrl = 'https://app.example.com/callback?param=value';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('client_id=client%20with%20spaces');
      expect(result).toContain('state=state%2Fwith%2Fslashes');
      expect(result).toContain('code_challenge=challenge%2Bwith%2Bplus');
      expect(result).toContain('redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback%3Fparam%3Dvalue');
    });

    it('should include offline_access scope when supported', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.CODE,
        oidcScopesSupported: ['openid', 'offline_access']
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('scope=openid%20offline_access');
    });

    it('should not include offline_access scope when not supported', () => {
      const config = mockOpenIdConfig({
        authFlow: OpenIdAuthFlowType.CODE,
        oidcScopesSupported: ['openid']
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      const result = openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);

      expect(result).toContain('scope=openid');
      expect(result).not.toContain('offline_access');
    });

    it('should throw OpenIdError when security config is missing', () => {
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(undefined);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      expect(() => {
        openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);
      }).toThrow(OpenIdError);
      expect(() => {
        openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);
      }).toThrow('OpenID security configuration is not available');
    });

    it('should throw OpenIdError when OpenID config is missing', () => {
      const securityConfig = {} as SecurityConfig;
      securityConfig.openidSecurityConfig = undefined as unknown as OpenidSecurityConfig;
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      expect(() => {
        openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);
      }).toThrow(OpenIdError);
    });

    it('should throw OpenIdError for unknown auth flow', () => {
      const config = mockOpenIdConfig({
        authFlow: 'unknown-flow' as unknown as OpenIdAuthFlowType
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const state = 'random-state-123';
      const codeChallenge = 'code-challenge-456';
      const redirectUrl = 'https://app.example.com/callback';

      expect(() => {
        openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);
      }).toThrow(OpenIdError);
      expect(() => {
        openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);
      }).toThrow('Invalid OpenID authentication flow');
    });
  });

  describe('buildLogoutUrl', () => {
    it('should build logout URL with client ID and redirect URI', () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const redirectUrl = 'https://app.example.com/home';

      const result = openIdUrlBuilder.buildLogoutUrl(redirectUrl);

      expect(result).toBe(
        `https://auth.example.com/logout?client_id=test-client-id&post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`
      );
    });

    it('should properly encode redirect URL in logout URL', () => {
      const config = mockOpenIdConfig();
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const redirectUrl = 'https://app.example.com/home?param=value&other=test';

      const result = openIdUrlBuilder.buildLogoutUrl(redirectUrl);

      expect(result).toContain('post_logout_redirect_uri=https%3A%2F%2Fapp.example.com%2Fhome%3Fparam%3Dvalue%26other%3Dtest');
    });

    it('should properly encode client ID with special characters', () => {
      const config = mockOpenIdConfig({
        clientId: 'client-with-special-chars/&='
      });
      const securityConfig = mockSecurityConfig(config);
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const redirectUrl = 'https://app.example.com/home';

      const result = openIdUrlBuilder.buildLogoutUrl(redirectUrl);

      expect(result).toContain('client_id=client-with-special-chars%2F%26%3D');
    });

    it('should throw OpenIdError when security config is missing', () => {
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(undefined);

      const redirectUrl = 'https://app.example.com/home';

      expect(() => {
        openIdUrlBuilder.buildLogoutUrl(redirectUrl);
      }).toThrow(OpenIdError);
      expect(() => {
        openIdUrlBuilder.buildLogoutUrl(redirectUrl);
      }).toThrow('OpenID security configuration is not available');
    });

    it('should throw OpenIdError when OpenID config is missing', () => {
      const securityConfig = {} as SecurityConfig;
      securityConfig.openidSecurityConfig = undefined as unknown as OpenidSecurityConfig;
      jest.spyOn(securityContextService, 'getSecurityConfig').mockReturnValue(securityConfig);

      const redirectUrl = 'https://app.example.com/home';

      expect(() => {
        openIdUrlBuilder.buildLogoutUrl(redirectUrl);
      }).toThrow(OpenIdError);
    });
  });
});
