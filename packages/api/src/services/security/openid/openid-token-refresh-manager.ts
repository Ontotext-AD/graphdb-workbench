import {service} from '../../../providers';
import {LoggerProvider} from '../../logging/logger-provider';
import {OpenidStorageService} from './openid-storage.service';
import {OpenidTokenUtils} from './openid-token-utils';
import {WindowService} from '../../window';
import {RefreshTokenConfiguration} from '../../../models/security/authentication';

/**
 * Manages automatic refresh of OpenID Connect tokens before they expire.
 *
 * Handles scheduling and execution of token refresh operations using refresh tokens,
 * with automatic timing based on token expiration times.
 */
export class OpenIdTokenRefreshManager {
  private readonly DEFAULT_REFRESH_CONFIGURATION: RefreshTokenConfiguration = {refreshAheadMs: 60_000, minDelayMs: 1_000};
  private readonly logger = LoggerProvider.logger;
  private readonly tokenUtils = service(OpenidTokenUtils);
  private readonly openidStorageService = service(OpenidStorageService);
  private refreshTokensTimer?: number;

  /**
   * Sets up automatic token refresh based on current token expiration.
   * @param refreshCallback Function to call when refresh is needed
   *
   * @returns Promise that resolves when setup is complete
   */
  async setupTokensRefresh(refreshCallback: (refreshToken: string) => Promise<void>): Promise<void> {
    const refreshToken = this.openidStorageService.getRefreshToken().getValue();

    if (!refreshToken || !this.shouldSetupRefresh(refreshToken)) {
      this.clearRefreshTimer();
      this.logger.debug('OpenID: no valid refresh token');
      return;
    }
    const accessToken = this.openidStorageService.getAccessToken().getValue()!;

    const refreshDelay = this.calculateRefreshDelay(accessToken);
    if (refreshDelay < this.DEFAULT_REFRESH_CONFIGURATION.minDelayMs) {
      this.logger.debug('OpenID: tokens need refresh now, ' + refreshDelay);
      await this.executeImmediateRefresh(refreshToken, refreshCallback);
    } else {
      this.logger.debug('OpenID: scheduling token refresh in', refreshDelay / 1000, 'seconds');
      this.scheduleTokenRefresh(refreshToken, refreshDelay, refreshCallback);
    }
  }

  /**
   * Clears any scheduled token refresh timer.
   */
  clearRefreshTimer(): void {
    if (this.refreshTokensTimer) {
      WindowService.getWindow().clearTimeout(this.refreshTokensTimer);
      delete this.refreshTokensTimer;
    }
  }

  /**
   * Determines if token refresh should be set up based on refresh token validity.
   * @param refreshToken The refresh token to check
   * @returns True if refresh should be set up
   */
  shouldSetupRefresh(refreshToken: string | null): boolean {
    return !!(refreshToken && this.tokenUtils.hasValidRefreshToken());
  }

  /**
   * Calculates delay in milliseconds until token refresh should occur.
   * @private
   * @param token The token to calculate delay for
   * @returns Delay in milliseconds
   */
  private calculateRefreshDelay(token: string): number {
    let tokenPayload;
    try {
      tokenPayload = this.tokenUtils.getTokenPayload(token) as Record<string, number>;
    } catch {
      return 0;
    }

    if (!tokenPayload['exp'] || tokenPayload['exp'] <= 0) {
      return 0;
    }
    return tokenPayload['exp'] * 1000 - Date.now() - this.DEFAULT_REFRESH_CONFIGURATION.refreshAheadMs;
  }

  /**
   * Executes immediate token refresh when tokens are about to expire.
   * @private
   * @param refreshToken The refresh token to use
   * @param refreshCallback The callback function to perform the refresh
   * @returns Promise that resolves when refresh is complete
   */
  private async executeImmediateRefresh(refreshToken: string, refreshCallback: (refreshToken: string) => Promise<void>): Promise<void> {
    this.clearRefreshTimer();
    this.logger.debug('OpenID: tokens will refresh now');
    await refreshCallback(refreshToken);
  }

  /**
   * Schedules token refresh to occur after specified delay.
   * @private
   * @param refreshToken The refresh token to use
   * @param delay Delay in milliseconds before refresh
   * @param refreshCallback The callback function to perform the refresh
   */
  private scheduleTokenRefresh(refreshToken: string, delay: number, refreshCallback: (refreshToken: string) => Promise<void>): void {
    this.clearRefreshTimer(); // Clear any existing timer before scheduling a new one
    this.refreshTokensTimer = WindowService.getWindow().setTimeout(async () => {
      this.logger.debug('OpenID: tokens will refresh now, ' + delay);
      await refreshCallback(refreshToken);
    }, delay);
  }
}
