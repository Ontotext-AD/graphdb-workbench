import {OpenIdTokenRefreshManager} from '../openid-token-refresh-manager';
import {OpenidTokenUtils} from '../openid-token-utils';
import {OpenidStorageService} from '../openid-storage.service';
import {WindowService} from '../../../window';
import {service} from '../../../../providers';

// Helper: base64url encoding
const b64url = (input: string) => Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

// Helper: create a simple unsigned JWT string from header/payload objects
const makeJwt = (header: Record<string, unknown>, payload: Record<string, unknown>): string => {
  return `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}.signature`;
};

describe('OpenIdTokenRefreshManager', () => {
  let tokenRefreshManager: OpenIdTokenRefreshManager;
  let openidStorageService: OpenidStorageService;
  let tokenUtils: OpenidTokenUtils;
  let mockWindow: Window;
  let mockSetTimeout: jest.SpyInstance;
  let mockClearTimeout: jest.SpyInstance;

  // Configuration stubs
  const REFRESH_CONFIGURATION = {
    refreshAheadMs: 60_000, // 60 seconds before expiry
    minDelayMs: 1_000 // Minimum 1 second delay
  };

  // Time constants for testing
  const NOW = 1000000; // Mock current time in seconds
  const FIVE_MINUTES = 300;
  const TEN_MINUTES = 600;

  /**
   * Creates a mock token with a specific expiration time
   * @param expiresInSeconds - Seconds from NOW when the token expires
   */
  const createMockToken = (expiresInSeconds: number): string => {
    return makeJwt(
      {alg: 'RS256', typ: 'JWT'},
      {exp: NOW + expiresInSeconds, iat: NOW, sub: 'test-user'}
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Date.now() for consistent time-based tests
    jest.spyOn(Date, 'now').mockReturnValue(NOW * 1000);

    // Mock WindowService.getWindow() to return a controlled mock window
    // This must be done BEFORE creating the tokenRefreshManager instance
    mockWindow = {
      setTimeout: jest.fn(() => 12345),
      clearTimeout: jest.fn()
    } as unknown as Window;

    mockSetTimeout = mockWindow.setTimeout as jest.Mock;
    mockClearTimeout = mockWindow.clearTimeout as jest.Mock;

    // Mock the static method directly
    WindowService.getWindow = jest.fn().mockReturnValue(mockWindow);

    // Create real service instances AFTER mocking WindowService
    tokenRefreshManager = new OpenIdTokenRefreshManager();
    openidStorageService = service(OpenidStorageService);
    tokenUtils = service(OpenidTokenUtils);

    // Clear all OpenID-related storage
    openidStorageService.clearAccessToken();
    openidStorageService.clearIdToken();
    openidStorageService.clearRefreshToken();
    openidStorageService.clearTokenType();
    openidStorageService.clearPkceState();
    openidStorageService.clearPkceCodeVerifier();
    openidStorageService.clearNonce();
    openidStorageService.clearReturnUrl();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tokenRefreshManager.clearRefreshTimer();
  });

  describe('setupTokensRefresh', () => {
    it('should not setup refresh when no refresh token exists', async () => {
      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      expect(refreshCallback).not.toHaveBeenCalled();
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should not setup refresh when refresh token is invalid', async () => {
      const refreshToken = createMockToken(FIVE_MINUTES);
      openidStorageService.setRefreshToken(refreshToken);

      // Mock hasValidRefreshToken to return false
      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(false);

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      expect(refreshCallback).not.toHaveBeenCalled();
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should schedule refresh when token has sufficient time before expiry', async () => {
      const refreshToken = createMockToken(FIVE_MINUTES);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + FIVE_MINUTES,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should schedule for later (5 minutes - 60 seconds ahead = 4 minutes = 240 seconds)
      const expectedDelay = (FIVE_MINUTES - REFRESH_CONFIGURATION.refreshAheadMs / 1000) * 1000;
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), expectedDelay);
      expect(refreshCallback).not.toHaveBeenCalled();
    });

    it('should execute immediate refresh when token expires soon', async () => {
      // Token expires in 30 seconds, which is less than refreshAheadMs (60 seconds)
      const refreshToken = createMockToken(30);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + 30,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should refresh immediately
      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should execute immediate refresh when token is already expired', async () => {
      // Token expired 10 seconds ago
      const refreshToken = createMockToken(-10);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW - 10,
        iat: NOW - TEN_MINUTES,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should refresh immediately
      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should execute scheduled refresh callback when timer fires', async () => {
      const refreshToken = createMockToken(FIVE_MINUTES);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + FIVE_MINUTES,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Get the callback that was passed to setTimeout
      const scheduledCallback = mockSetTimeout.mock.calls[0][0];

      // Execute the scheduled callback
      await scheduledCallback();

      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
    });

    it('should clear existing timer before setting up new refresh', async () => {
      const refreshToken1 = createMockToken(FIVE_MINUTES);
      openidStorageService.setRefreshToken(refreshToken1);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + FIVE_MINUTES,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      // First setup
      await tokenRefreshManager.setupTokensRefresh(refreshCallback);
      expect(mockSetTimeout).toHaveBeenCalledTimes(1);

      // Second setup with different token
      const refreshToken2 = createMockToken(TEN_MINUTES);
      openidStorageService.setRefreshToken(refreshToken2);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + TEN_MINUTES,
        iat: NOW,
        sub: 'test-user'
      });

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should have cleared the old timer and set a new one
      expect(mockClearTimeout).toHaveBeenCalledWith(12345);
      expect(mockSetTimeout).toHaveBeenCalledTimes(2);
    });

    it('should handle refresh callback errors gracefully', async () => {
      const refreshToken = createMockToken(30);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + 30,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockRejectedValue(new Error('Refresh failed'));

      await expect(tokenRefreshManager.setupTokensRefresh(refreshCallback))
        .rejects.toThrow('Refresh failed');

      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
    });

    it('should handle token without expiration', async () => {
      const refreshToken = 'invalid-token-without-exp';
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      // Mock a payload without 'exp' field - only numeric values
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        iat: NOW
        // No 'exp' field
      } as Record<string, number>);

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should refresh immediately when exp is missing or invalid
      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('clearRefreshTimer', () => {
    it('should clear active timer', async () => {
      const refreshToken = createMockToken(FIVE_MINUTES);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + FIVE_MINUTES,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      // Setup a timer
      await tokenRefreshManager.setupTokensRefresh(refreshCallback);
      expect(mockSetTimeout).toHaveBeenCalled();

      // Clear the timer
      tokenRefreshManager.clearRefreshTimer();

      expect(mockClearTimeout).toHaveBeenCalledWith(12345);
    });

    it('should not throw error when clearing non-existent timer', () => {
      // Should not throw
      expect(() => tokenRefreshManager.clearRefreshTimer()).not.toThrow();
      expect(mockClearTimeout).not.toHaveBeenCalled();
    });

    it('should allow multiple calls to clearRefreshTimer', async () => {
      const refreshToken = createMockToken(FIVE_MINUTES);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + FIVE_MINUTES,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      // Setup a timer
      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Clear multiple times
      tokenRefreshManager.clearRefreshTimer();
      tokenRefreshManager.clearRefreshTimer();
      tokenRefreshManager.clearRefreshTimer();

      // Should only call clearTimeout once (subsequent calls have no timer)
      expect(mockClearTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('shouldSetupRefresh', () => {
    it('should return true when refresh token exists and is valid', () => {
      const refreshToken = createMockToken(FIVE_MINUTES);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);

      const result = tokenRefreshManager.shouldSetupRefresh(refreshToken);

      expect(result).toBe(true);
    });

    it('should return false when refresh token is null', () => {
      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);

      const result = tokenRefreshManager.shouldSetupRefresh(null);

      expect(result).toBe(false);
    });

    it('should return false when refresh token is invalid', () => {
      const refreshToken = createMockToken(FIVE_MINUTES);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(false);

      const result = tokenRefreshManager.shouldSetupRefresh(refreshToken);

      expect(result).toBe(false);
    });

    it('should return false when refresh token is empty string', () => {
      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);

      const result = tokenRefreshManager.shouldSetupRefresh('');

      expect(result).toBe(false);
    });

    it('should return false when tokenUtils indicates invalid refresh token', () => {
      const refreshToken = createMockToken(FIVE_MINUTES);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(false);

      const result = tokenRefreshManager.shouldSetupRefresh(refreshToken);

      expect(result).toBe(false);
      expect(tokenUtils.hasValidRefreshToken).toHaveBeenCalled();
    });
  });

  describe('configuration defaults', () => {
    it('should use default refreshAheadMs of 60 seconds', async () => {
      const refreshToken = createMockToken(FIVE_MINUTES);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + FIVE_MINUTES,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Verify the delay accounts for 60 seconds refresh ahead
      const expectedDelay = (FIVE_MINUTES * 1000) - 60_000; // 5 minutes minus 60 seconds
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), expectedDelay);
    });

    it('should use default minDelayMs of 1 second', async () => {
      // Token expires in exactly 61 seconds (1 second after accounting for refreshAheadMs)
      const refreshToken = createMockToken(61);
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: NOW + 61,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should schedule with 1 second delay (61 - 60 refreshAheadMs = 1)
      const expectedDelay = 1_000;
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), expectedDelay);
      expect(refreshCallback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle token with zero expiration time', async () => {
      const refreshToken = 'token-with-zero-exp';
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: 0,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should refresh immediately
      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should handle token with negative expiration time', async () => {
      const refreshToken = 'token-with-negative-exp';
      openidStorageService.setRefreshToken(refreshToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);
      jest.spyOn(tokenUtils, 'getTokenPayload').mockReturnValue({
        exp: -1,
        iat: NOW,
        sub: 'test-user'
      });

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should refresh immediately
      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });

    it('should handle null token payload', async () => {
      const refreshToken = 'malformed-token';
      openidStorageService.setRefreshToken(refreshToken);

      const accessToken = createMockToken(50);
      openidStorageService.setAccessToken(accessToken);

      jest.spyOn(tokenUtils, 'hasValidRefreshToken').mockReturnValue(true);

      const refreshCallback = jest.fn().mockResolvedValue(undefined);

      await tokenRefreshManager.setupTokensRefresh(refreshCallback);

      // Should refresh immediately when payload is null
      expect(refreshCallback).toHaveBeenCalledWith(refreshToken);
      expect(mockSetTimeout).not.toHaveBeenCalled();
    });
  });
});
