import {OpenidTokenUtils} from '../openid-token-utils';
import {OpenidSecurityConfig, SecurityConfig} from '../../../../models/security';
import {TokenType} from '../../../../models/security/authentication/openid-token-type';
import {service} from '../../../../providers';
import {OpenidStorageService} from '../openid-storage.service';
import {SecurityContextService} from '../../security-context.service';
import {KEYUTIL, KJUR} from 'jsrsasign';

// Helper: base64url encoding
const b64url = (input: string) => Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

// Helper: create a simple unsigned JWT string from header/payload objects
const makeJwt = (header: Record<string, unknown>, payload: Record<string, unknown>): string => {
  return `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}.signature`;
};

describe('OpenidTokenUtils', () => {
  let tokenUtils: OpenidTokenUtils;
  let openidStorageService: OpenidStorageService;
  let securityContextService: SecurityContextService;

  const mockOpenIdConfig = (overrides: Partial<OpenidSecurityConfig> = {}): OpenidSecurityConfig => {
    return new OpenidSecurityConfig({
      clientId: 'test-client',
      issuer: 'https://issuer.example',
      tokenType: TokenType.ACCESS,
      tokenAudience: 'api://default',
      tokenIssuer: 'https://token-issuer.example',
      ...overrides
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create real service instances
    tokenUtils = service(OpenidTokenUtils);
    openidStorageService = service(OpenidStorageService);
    securityContextService = service(SecurityContextService);

    // Clear all OpenID-related storage
    openidStorageService.clearAccessToken();
    openidStorageService.clearIdToken();
    openidStorageService.clearRefreshToken();
    openidStorageService.clearTokenType();
    openidStorageService.clearPkceState();
    openidStorageService.clearPkceCodeVerifier();
    openidStorageService.clearNonce();
    openidStorageService.clearReturnUrl();

    // Reset JWKS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    securityContextService.updateJsonWebKeysSet({} as any);
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

  describe('authHeaderGraphDB', () => {
    it('should return Bearer with ID token when token type is ID', () => {
      openidStorageService.setIdToken('id-123');
      openidStorageService.setTokenType(TokenType.ID);

      const header = tokenUtils.authHeaderGraphDB();

      expect(header).toBe('Bearer id-123');
    });

    it('should return Bearer with ACCESS token when token type is ACCESS', () => {
      openidStorageService.setAccessToken('acc-456');
      openidStorageService.setTokenType(TokenType.ACCESS);

      const header = tokenUtils.authHeaderGraphDB();

      expect(header).toBe('Bearer acc-456');
    });
  });

  describe('saveTokens', () => {
    it('should persist provided tokens and token type', () => {
      const tokens = {
        access_token: 'new-access',
        id_token: 'new-id',
        refresh_token: 'new-refresh'
      };
      const config = mockOpenIdConfig({ tokenType: TokenType.ID });

      tokenUtils.saveTokens(tokens, config);

      expect(openidStorageService.getAccessToken().getValue()).toBe('new-access');
      expect(openidStorageService.getIdToken().getValue()).toBe('new-id');
      expect(openidStorageService.getRefreshToken().getValue()).toBe('new-refresh');
      expect(openidStorageService.getTokenType().getValue()).toBe(TokenType.ID);
    });

    it('should clear PKCE data when saving tokens', () => {
      // Store PKCE data
      openidStorageService.setPkceState('state');
      openidStorageService.setPkceCodeVerifier('verifier');

      const tokens = {
        access_token: 'new-access',
        id_token: 'new-id',
        refresh_token: 'new-refresh'
      };
      const config = mockOpenIdConfig({ tokenType: TokenType.ID });

      tokenUtils.saveTokens(tokens, config);

      // Verify PKCE data was cleared
      expect(openidStorageService.getPkceState().getValue()).toBeNull();
      expect(openidStorageService.getPkceCodeVerifier().getValue()).toBeNull();
    });

    it('should clear missing tokens from storage', () => {
      // Pre-populate tokens
      openidStorageService.setAccessToken('acc');
      openidStorageService.setIdToken('id');
      openidStorageService.setRefreshToken('ref');

      const tokens = {
        access_token: 'acc2'
      } as const;
      const config = mockOpenIdConfig({ tokenType: TokenType.ACCESS });

      tokenUtils.saveTokens(tokens, config);

      expect(openidStorageService.getAccessToken().getValue()).toBe('acc2');
      expect(openidStorageService.getIdToken().getValue()).toBeNull();
      expect(openidStorageService.getRefreshToken().getValue()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should remove all tokens from storage', () => {
      openidStorageService.setAccessToken('a');
      openidStorageService.setIdToken('b');
      openidStorageService.setRefreshToken('c');

      tokenUtils.clearTokens();

      expect(openidStorageService.getAccessToken().getValue()).toBeNull();
      expect(openidStorageService.getIdToken().getValue()).toBeNull();
      expect(openidStorageService.getRefreshToken().getValue()).toBeNull();
    });
  });

  describe('getTokenByType', () => {
    it('should return correct token by type', () => {
      openidStorageService.setAccessToken('acc');
      openidStorageService.setIdToken('id');
      openidStorageService.setRefreshToken('ref');

      expect(tokenUtils.getTokenByType(TokenType.ACCESS)).toBe('acc');
      expect(tokenUtils.getTokenByType(TokenType.ID)).toBe('id');
      expect(tokenUtils.getTokenByType(TokenType.REFRESH)).toBe('ref');
    });

    it('should return null when token is not present', () => {
      expect(tokenUtils.getTokenByType(TokenType.ACCESS)).toBeNull();
    });

    it('should return null for unknown token type', () => {
      expect(tokenUtils.getTokenByType('unknown' as unknown as TokenType)).toBeNull();
    });
  });

  describe('getTokenHeader', () => {
    it('should decode and return JWT header object', () => {
      const header = { alg: 'RS256', kid: 'k1', typ: 'JWT' };
      const payload = { sub: '123' };
      const jwt = makeJwt(header, payload);

      const decoded = tokenUtils.getTokenHeader(jwt) as Record<string, unknown>;

      expect(decoded.alg).toBe('RS256');
      expect(decoded.kid).toBe('k1');
    });

    it('should return undefined when header cannot be decoded', () => {
      const invalid = '###.eyJzdWIiOiIxMjMifQ.signature';

      expect(tokenUtils.getTokenHeader(invalid)).toBeUndefined();
    });
  });

  describe('getTokenPayload', () => {
    it('should decode and return JWT payload object', () => {
      const header = { alg: 'RS256', kid: 'k1', typ: 'JWT' };
      const now = Math.floor(Date.now() / 1000);
      const payload = { sub: '123', iat: now };
      const jwt = makeJwt(header, payload);

      const decoded = tokenUtils.getTokenPayload(jwt) as Record<string, unknown>;

      expect(decoded.sub).toBe('123');
      expect(decoded.iat).toBe(now);
    });

    it('should return undefined when payload cannot be decoded', () => {
      const invalid = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.###.signature';

      expect(tokenUtils.getTokenPayload(invalid)).toBeUndefined();
    });
  });

  describe('hasValidRefreshToken', () => {
    it('should return false when no refresh token exists', () => {
      expect(tokenUtils.hasValidRefreshToken()).toBe(false);
    });

    it('should return true for non-JWT (opaque) refresh token', () => {
      openidStorageService.setRefreshToken('opaque-refresh');

      expect(tokenUtils.hasValidRefreshToken()).toBe(true);
    });

    it('should return false when nbf is in the future beyond tolerance', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { nbf: now + 10, iat: now };
      const jwt = makeJwt({ alg: 'RS256', kid: 'k1' }, payload);
      openidStorageService.setRefreshToken(jwt);

      expect(tokenUtils.hasValidRefreshToken()).toBe(false);
    });

    it('should return false when token is expired beyond tolerance', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { exp: now - 10, iat: now - 100 };
      const jwt = makeJwt({ alg: 'RS256', kid: 'k1' }, payload);
      openidStorageService.setRefreshToken(jwt);

      expect(tokenUtils.hasValidRefreshToken()).toBe(false);
    });

    it('should return true when iat is present and token is not expired', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = { iat: now };
      const jwt = makeJwt({ alg: 'RS256', kid: 'k1' }, payload);
      openidStorageService.setRefreshToken(jwt);

      expect(tokenUtils.hasValidRefreshToken()).toBe(true);
    });

    it('should return false when JWT refresh token has no iat/exp/nbf', () => {
      const jwt = makeJwt({ alg: 'RS256' }, {});
      openidStorageService.setRefreshToken(jwt);

      expect(tokenUtils.hasValidRefreshToken()).toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should return false when token is missing', () => {
      const config = mockOpenIdConfig();

      expect(tokenUtils.verifyToken(TokenType.ID, config)).toBe(false);
    });

    describe('ID token verification', () => {
      it('should return false when JWT header has no kid', () => {
        const header = { alg: 'RS256' };
        const payload = { sub: 'abc' };
        const jwt = makeJwt(header, payload);
        openidStorageService.setIdToken(jwt);
        const config = mockOpenIdConfig();

        expect(tokenUtils.verifyToken(TokenType.ID, config)).toBe(false);
      });

      it('should return false when JWKS key is missing', () => {
        const header = { alg: 'RS256', kid: 'missing-kid' };
        const payload = { sub: '123' };
        const jwt = makeJwt(header, payload);
        openidStorageService.setIdToken(jwt);
        const config = mockOpenIdConfig();

        expect(tokenUtils.verifyToken(TokenType.ID, config)).toBe(false);
      });

      it('should verify using JWKS, audience and nonce', () => {
        const kid = 'kid-123';
        const header = { alg: 'RS256', kid };
        const payload = { sub: 'user1' };
        const jwt = makeJwt(header, payload);
        openidStorageService.setIdToken(jwt);
        openidStorageService.setNonce('nonce-abc');

        // Provide JWKS
        securityContextService.updateJsonWebKeysSet({ [kid]: { kid } } as unknown as Record<string, JsonWebKey & { kid: string }>);

        // Mock KEYUTIL and KJUR verify
        const getKeySpy = jest.spyOn(KEYUTIL, 'getKey').mockReturnValue('publicKey' as unknown as ReturnType<typeof KEYUTIL.getKey>);
        const verifySpy = jest.spyOn(KJUR.jws.JWS, 'verifyJWT').mockReturnValue(true);

        const config = mockOpenIdConfig({ clientId: 'client-1', issuer: 'https://issuer.example' });
        const result = tokenUtils.verifyToken(TokenType.ID, config);

        expect(result).toBe(true);
        expect(getKeySpy).toHaveBeenCalled();
        expect(verifySpy).toHaveBeenCalled();

        const verifyFields = verifySpy.mock.calls[0]?.[2] as Record<string, string[]> | undefined;
        expect(verifyFields).toBeDefined();
        expect(verifyFields!.alg).toEqual([header.alg]);
        expect(verifyFields!.iss).toEqual([config.issuer]);
        expect(verifyFields!.aud).toEqual([config.clientId, config.issuer]);
        expect(verifyFields!.nonce).toEqual([openidStorageService.getNonce().getValue() || '']);
      });

      it('should return false when verification fails', () => {
        const kid = 'kid-789';
        const header = { alg: 'RS256', kid };
        const payload = { sub: 'user3' };
        const jwt = makeJwt(header, payload);
        openidStorageService.setIdToken(jwt);
        securityContextService.updateJsonWebKeysSet({ [kid]: { kid } } as unknown as Record<string, JsonWebKey & { kid: string }>);

        jest.spyOn(KEYUTIL, 'getKey').mockReturnValue('publicKey' as unknown as ReturnType<typeof KEYUTIL.getKey>);
        jest.spyOn(KJUR.jws.JWS, 'verifyJWT').mockReturnValue(false);

        const config = mockOpenIdConfig();
        const result = tokenUtils.verifyToken(TokenType.ID, config);

        expect(result).toBe(false);
      });
    });

    describe('ACCESS token verification', () => {
      it('should use tokenIssuer and tokenAudience in verification', () => {
        const kid = 'kid-456';
        const header = { alg: 'RS256', kid };
        const payload = { scope: 'read' };
        const jwt = makeJwt(header, payload);
        openidStorageService.setAccessToken(jwt);

        // Provide JWKS
        securityContextService.updateJsonWebKeysSet({ [kid]: { kid } } as unknown as Record<string, JsonWebKey & { kid: string }>);

        // Mock KEYUTIL and KJUR verify
        jest.spyOn(KEYUTIL, 'getKey').mockReturnValue('publicKey' as unknown as ReturnType<typeof KEYUTIL.getKey>);
        const verifySpy = jest.spyOn(KJUR.jws.JWS, 'verifyJWT').mockReturnValue(true);

        const config = mockOpenIdConfig({ tokenIssuer: 'https://token-issuer.example', tokenAudience: 'api://aud1' });
        const result = tokenUtils.verifyToken(TokenType.ACCESS, config);

        expect(result).toBe(true);

        const verifyFields = verifySpy.mock.calls[0]?.[2];
        expect(verifyFields).toBeDefined();
        expect(verifyFields!.alg).toEqual([header.alg]);
        expect(verifyFields!.iss).toEqual([config.tokenIssuer]);
        expect(verifyFields!.aud).toEqual([config.tokenAudience]);
      });

      it('should consider non-JWT token (header.error present) as valid', () => {
        const header = { error: 'not-jwt' } as const;
        const payload = { any: 'thing' } as const;
        const jwt = makeJwt(header, payload);
        openidStorageService.setAccessToken(jwt);

        const config = mockOpenIdConfig();
        const result = tokenUtils.verifyToken(TokenType.ACCESS, config);

        expect(result).toBe(true);
      });

      it('should return false when header has no kid and no error', () => {
        const header = { alg: 'RS256' } as const;
        const payload = { sub: 'abc' } as const;
        const jwt = makeJwt(header, payload);
        openidStorageService.setAccessToken(jwt);

        const config = mockOpenIdConfig();
        const result = tokenUtils.verifyToken(TokenType.ACCESS, config);

        expect(result).toBe(false);
      });
    });
  });

  describe('hasValidIdToken', () => {
    it('should return false when no id token is present', () => {
      const config = mockOpenIdConfig();

      const result = tokenUtils.hasValidIdToken(config);

      expect(result).toBe(false);
    });

    it('should return true when id token verifies successfully', () => {
      const kid = 'kidX';
      const header = { alg: 'RS256', kid };
      const payload = { sub: 'user' };
      const jwt = makeJwt(header, payload);
      openidStorageService.setIdToken(jwt);
      securityContextService.updateJsonWebKeysSet({ [kid]: { kid } } as unknown as Record<string, JsonWebKey & { kid: string }>);

      jest.spyOn(KEYUTIL, 'getKey').mockReturnValue('publicKey' as unknown as ReturnType<typeof KEYUTIL.getKey>);
      jest.spyOn(KJUR.jws.JWS, 'verifyJWT').mockReturnValue(true);

      const config = mockOpenIdConfig();
      const result = tokenUtils.hasValidIdToken(config);

      expect(result).toBe(true);
    });

    it('should return false when id token verification fails', () => {
      const kid = 'kidY';
      const header = { alg: 'RS256', kid };
      const payload = { sub: 'user' };
      const jwt = makeJwt(header, payload);
      openidStorageService.setIdToken(jwt);
      securityContextService.updateJsonWebKeysSet({ [kid]: { kid } } as unknown as Record<string, JsonWebKey & { kid: string }>);

      jest.spyOn(KEYUTIL, 'getKey').mockReturnValue('publicKey' as unknown as ReturnType<typeof KEYUTIL.getKey>);
      jest.spyOn(KJUR.jws.JWS, 'verifyJWT').mockReturnValue(false);

      const config = mockOpenIdConfig();
      const result = tokenUtils.hasValidIdToken(config);

      expect(result).toBe(false);
    });
  });
});
