import {OpenIdAuthFlowHandler, ExchangeTokensCallback} from '../openid-auth-flow-handler';
import {OpenidSecurityConfig} from '../../../../models/security';
import {OpenIdAuthFlowType, AuthFlowParams} from '../../../../models/security/authentication';
import {OpenIdError} from '../errors/openid-error';
import {InvalidOpenidAuthFlow} from '../errors/invalid-openid-auth-flow';
import {MissingAuthorizationCode} from '../errors/missing-authorization-code';
import {OpenidStorageService} from '../openid-storage.service';
import {service} from '../../../../providers';

describe('OpenIdAuthFlowHandler', () => {
  let handler: OpenIdAuthFlowHandler;
  let storageService: OpenidStorageService;
  let exchangeTokensCallback: jest.MockedFunction<ExchangeTokensCallback>;

  const createConfig = (authFlow: string) => new OpenidSecurityConfig({ authFlow });

  const createParams = (overrides: Partial<AuthFlowParams> = {}): AuthFlowParams => ({
    code: 'test-code',
    state: 'test-state',
    ...overrides,
  });

  beforeEach(() => {
    handler = new OpenIdAuthFlowHandler();
    storageService = service(OpenidStorageService);
    exchangeTokensCallback = jest.fn();

    // Clear storage before each test
    storageService.clearPkceState();
    storageService.clearPkceCodeVerifier();
    storageService.clearAccessToken();
    storageService.clearIdToken();
    storageService.clearRefreshToken();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Clean up storage after each test
    storageService.clearPkceState();
    storageService.clearPkceCodeVerifier();
    storageService.clearAccessToken();
    storageService.clearIdToken();
    storageService.clearRefreshToken();
  });

  describe('handleAuthorizationCode', () => {
    describe('PKCE flow', () => {
      it('should successfully handle authorization code with PKCE', async () => {
        const config = createConfig(OpenIdAuthFlowType.CODE);
        const params = createParams();
        handler.storeCodeFlowData(params.state!);

        const result = await handler.handleAuthorizationCode(config, params, exchangeTokensCallback);

        expect(result).toBe(true);
        expect(exchangeTokensCallback).toHaveBeenCalledTimes(1);
        expect(exchangeTokensCallback).toHaveBeenCalledWith(
          params.code,
          expect.stringContaining('login'),
          expect.any(String)
        );
      });

      it('should throw OpenIdError when PKCE state does not match', async () => {
        const config = createConfig(OpenIdAuthFlowType.CODE);
        const params = createParams({ state: 'different-state' });
        handler.storeCodeFlowData('expected-state');

        await expect(
          handler.handleAuthorizationCode(config, params, exchangeTokensCallback)
        ).rejects.toThrow(OpenIdError);

        expect(exchangeTokensCallback).not.toHaveBeenCalled();
      });

      it('should throw MissingAuthorizationCode when code is missing in PKCE flow', async () => {
        const config = createConfig(OpenIdAuthFlowType.CODE);
        const params = createParams({ code: undefined });
        handler.storeCodeFlowData(params.state!);

        await expect(
          handler.handleAuthorizationCode(config, params, exchangeTokensCallback)
        ).rejects.toThrow(MissingAuthorizationCode);
      });
    });

    describe('Code flow without PKCE', () => {
      it('should successfully handle authorization code without PKCE', async () => {
        const config = createConfig(OpenIdAuthFlowType.CODE_NO_PKCE);
        const params = createParams();

        const result = await handler.handleAuthorizationCode(config, params, exchangeTokensCallback);

        expect(result).toBe(true);
        expect(exchangeTokensCallback).toHaveBeenCalledTimes(1);
        expect(exchangeTokensCallback).toHaveBeenCalledWith(
          params.code,
          expect.stringContaining('login')
        );
        // Should not pass code verifier for non-PKCE flow
        expect(exchangeTokensCallback).not.toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.any(String)
        );
      });

      it('should throw MissingAuthorizationCode when code is missing', async () => {
        const config = createConfig(OpenIdAuthFlowType.CODE_NO_PKCE);
        const params = createParams({ code: null });

        await expect(
          handler.handleAuthorizationCode(config, params, exchangeTokensCallback)
        ).rejects.toThrow(MissingAuthorizationCode);
      });
    });

    describe('Invalid flow handling', () => {
      it('should throw InvalidOpenidAuthFlow for unsupported auth flow type', async () => {
        const config = createConfig('INVALID_FLOW');
        const params = createParams();

        await expect(
          handler.handleAuthorizationCode(config, params, exchangeTokensCallback)
        ).rejects.toThrow(InvalidOpenidAuthFlow);

        expect(exchangeTokensCallback).not.toHaveBeenCalled();
      });
    });
  });

  describe('handleImplicitFlow', () => {
    it('should save tokens for implicit flow', async () => {
      const config = createConfig(OpenIdAuthFlowType.IMPLICIT);
      const params = createParams({
        id_token: 'test-id-token',
        access_token: 'test-access-token',
      });

      await expect(
        handler.handleImplicitFlow(config, params)
      ).resolves.not.toThrow();
    });
  });

  describe('checkExistingAuthentication', () => {
    it('should return false when no tokens are present', () => {
      const config = createConfig(OpenIdAuthFlowType.CODE);

      const result = handler.checkExistingAuthentication(config);

      expect(result).toBe(false);
    });
  });

  describe('storeCodeFlowData', () => {
    it('should store PKCE state in storage', () => {
      const state = 'test-state-value';

      handler.storeCodeFlowData(state);

      expect(storageService.getPkceState().getValue()).toBe(state);
    });

    it('should generate and store PKCE code verifier', () => {
      const state = 'test-state-value';

      handler.storeCodeFlowData(state);

      const codeVerifier = storageService.getPkceCodeVerifier().getValue();
      expect(codeVerifier).toBeTruthy();
      expect(typeof codeVerifier).toBe('string');
      expect(codeVerifier!.length).toBeGreaterThan(0);
    });
  });

  describe('getCodeChallengeForCodeFlow', () => {
    it('should return code challenge when code verifier exists', () => {
      handler.storeCodeFlowData('test-state');

      const challenge = handler.getCodeChallengeForCodeFlow();

      expect(challenge).toBeTruthy();
      expect(typeof challenge).toBe('string');
      expect(challenge.length).toBeGreaterThan(0);
    });

    it('should throw OpenIdError when code verifier is missing', () => {
      // Ensure storage is clean
      storageService.clearPkceCodeVerifier();

      expect(() => handler.getCodeChallengeForCodeFlow()).toThrow(OpenIdError);
      expect(() => handler.getCodeChallengeForCodeFlow()).toThrow('Missing PKCE code verifier');
    });

    it('should return consistent challenge for same verifier', () => {
      handler.storeCodeFlowData('test-state');

      const challenge1 = handler.getCodeChallengeForCodeFlow();
      const challenge2 = handler.getCodeChallengeForCodeFlow();

      expect(challenge1).toBe(challenge2);
    });
  });
});
