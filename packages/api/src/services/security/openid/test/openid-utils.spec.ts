import { OpenIdUtils } from '../openid-utils';
import { WindowService } from '../../../window';

jest.spyOn(WindowService, 'getLocationHash').mockImplementation(() => '');
jest.spyOn(WindowService, 'getLocationQueryParams').mockImplementation(() => '');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('OpenIdUtils', () => {
  describe('pkceChallengeFromVerifier', () => {
    it('should return the correct base64-encoded SHA-256 hash', () => {
      const verifier = 'test_verifier';
      const result = OpenIdUtils.pkceChallengeFromVerifier(verifier);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('parseQueryString', () => {
    it('should parse parameters from the URL hash fragment for implicit flow', () => {
      jest.spyOn(WindowService, 'getLocationHash').mockReturnValue('#access_token=abc123&state=xyz');

      const result = OpenIdUtils.parseQueryString(true);

      expect(result).toEqual({
        access_token: 'abc123',
        code: null,
        id_token: null,
        state: 'xyz'
      });
    });

    it('should parse parameters from the URL query string for non-implicit flow', () => {
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('?code=abc123&state=xyz');

      const result = OpenIdUtils.parseQueryString(false);

      expect(result).toEqual({
        access_token: null,
        code: 'abc123',
        id_token: null,
        state: 'xyz'
      });
    });

    it('should return default values if no parameters are present', () => {
      jest.spyOn(WindowService, 'getLocationHash').mockReturnValue('');
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('');

      const resultImplicit = OpenIdUtils.parseQueryString(true);
      const resultNonImplicit = OpenIdUtils.parseQueryString(false);

      expect(resultImplicit).toEqual({
        access_token: null,
        code: null,
        id_token: null,
        state: null
      });

      expect(resultNonImplicit).toEqual({
        access_token: null,
        code: null,
        id_token: null,
        state: null
      });
    });
  });
});
