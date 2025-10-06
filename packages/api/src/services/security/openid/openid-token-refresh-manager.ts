import {service} from '../../../providers';
import {LoggerProvider} from '../../logging/logger-provider';
import {OpenidStorageService} from './openid-storage.service';
import {TokenType, OpenidTokenUtils} from './openid-token-utils';
import {OpenIdError} from './errors/openid-error';

/**
 * Manages automatic refresh of OpenID Connect tokens before they expire.
 *
 * Handles scheduling and execution of token refresh operations using refresh tokens,
 * with automatic timing based on token expiration times.
 */
export class OpenIdTokenRefreshManager {
  private readonly logger = LoggerProvider.logger;
  private readonly tokenUtils = service(OpenidTokenUtils);
  private readonly openidStorageService = service(OpenidStorageService);
  private refreshTokensTimer?: NodeJS.Timeout;

  /**
   * Sets up automatic token refresh based on current token expiration.
   * @param justGotTokens Whether tokens were just obtained (affects logging)
   * @param refreshCallback Function to call when refresh is needed
   */
  async setupTokensRefresh(justGotTokens = false, refreshCallback: (refreshToken: string) => Promise<void>): Promise<void> {
    const refreshToken = this.openidStorageService.getRefreshToken().getValue();

    if (!this.shouldSetupRefresh(refreshToken)) {
      this.logger.debug('oidc: no valid refresh token');
      return;
    }

    const refreshDelay = this.calculateRefreshDelay();
    if (refreshDelay < 1000) {
      this.logger.debug('oidc: tokens need refresh now, ' + refreshDelay + '; ' + justGotTokens);
      await this.executeImmediateRefresh(refreshToken!, justGotTokens, refreshCallback);
    } else {
      this.logger.debug('oidc: scheduling token refresh in', refreshDelay / 1000, 'seconds');
      this.scheduleTokenRefresh(refreshToken!, refreshDelay, refreshCallback);
    }
  }

  /**
   * Clears any scheduled token refresh timer.
   */
  clearRefreshTimer(): void {
    if (this.refreshTokensTimer) {
      clearTimeout(this.refreshTokensTimer);
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
   * @returns Delay in milliseconds (60 seconds before expiration)
   */
  private calculateRefreshDelay(): number {
    const token = this.tokenUtils.getTokenByType(TokenType.ID);
    if (!token) {
      throw new OpenIdError('No valid ID token found');
    }

    const accessToken = this.tokenUtils.getTokenPayload(token) as Record<string, number>;
    if (!accessToken || accessToken['exp'] <= 0) {
      return 0;
    }
    return accessToken['exp'] * 1000 - Date.now() - 60000;
  }

  /**
   * Executes immediate token refresh when tokens are about to expire.
   * @private
   */
  private async executeImmediateRefresh(refreshToken: string, justGotTokens: boolean, refreshCallback: (refreshToken: string) => Promise<void>): Promise<void> {
    this.clearRefreshTimer();
    const expiresIn = this.calculateRefreshDelay();
    this.logger.debug('oidc: tokens will refresh now, ' + expiresIn + '; ' + justGotTokens);
    await refreshCallback(refreshToken);
  }

  /**
   * Schedules token refresh to occur after specified delay.
   * @private
   */
  private scheduleTokenRefresh(refreshToken: string, delay: number, refreshCallback: (refreshToken: string) => Promise<void>): void {
    this.refreshTokensTimer = setTimeout(async () => {
      this.logger.debug('oidc: tokens will refresh now, ' + delay);
      await refreshCallback(refreshToken);
    }, delay);
  }
}
