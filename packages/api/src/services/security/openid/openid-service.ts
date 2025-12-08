import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {OpenIdRestService} from './openid-rest-service';
import {SecurityContextService} from '../security-context.service';
import {LoggerProvider} from '../../logging/logger-provider';
import {OpenidSecurityConfig} from '../../../models/security';
import {OpenIdUrlBuilder} from './openid-url-builder';
import {OpenIdAuthFlowHandler} from './openid-auth-flow-handler';
import {OpenIdTokenRefreshManager} from './openid-token-refresh-manager';
import {OpenidStorageService} from './openid-storage.service';
import {OpenidTokenUtils} from './openid-token-utils';
import {OpenIdUtils} from './openid-utils';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';
import {OpenIdError} from '../errors/openid/openid-error';
import {WindowService} from '../../window';
import {MissingOpenidConfiguration} from '../errors/openid/missing-openid-configuration';
import {getOrigin} from '../../utils';
import {AuthFlowParams, OpenIdAuthFlowType, OpenIdTokens} from '../../../models/security/authentication/openid-auth-flow-models';
import {Notification, NotificationParam} from '../../../models/notification';
import {notify} from '../../notification';
import {HttpErrorResponse} from '../../../models/http';

/**
 * Service responsible for managing OpenID Connect authentication flows, token management,
 * and security operations within the GraphDB workbench.
 */
export class OpenIdService implements Service {
  private readonly logger = LoggerProvider.logger;
  private readonly openIdRestService = service(OpenIdRestService);
  private readonly openidStorageService = service(OpenidStorageService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly tokenUtils = service(OpenidTokenUtils);
  private readonly authenticationStorageService = service(AuthenticationStorageService);
  private readonly authFlowHandler = service(OpenIdAuthFlowHandler);
  private readonly tokenRefreshManager = service(OpenIdTokenRefreshManager);
  private readonly openIdUrlBuilder = service(OpenIdUrlBuilder);

  // Public API methods

  /**
   * Retrieves the JSON Web Key Set (JWKS) from the OpenID provider.
   * The JWKS contains the public keys used to verify JWT tokens.
   *
   * @returns {Promise<{ keys: { kid: string }[] }>} resolving to an object containing an array of keys with their key IDs
   */
  getJSONWebKeySet(): Promise<{ keys: { kid: string }[] }> {
    return this.openIdRestService.getJSONWebKeySet();
  }

  /**
   * Exchanges an authorization code for OpenID tokens.
   * Used after redirect from provider in code flow.
   * @param {string} redirectUrl - Redirect URI used in the flow
   * @param {string} code - Authorization code from provider
   * @param {string | null} [codeVerifier] - PKCE code verifier (optional)
   * @returns {Promise<OpenIdTokens>} Tokens object
   */
  getTokens(redirectUrl: string, code: string, codeVerifier?: string | null): Promise<OpenIdTokens> {
    return this.openIdRestService.getTokens(redirectUrl, code, codeVerifier);
  }

  /**
   * Refreshes access tokens using a refresh token.
   * Saves new tokens and sets up next refresh.
   * Emits logout event on failure.
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<void>} Promise that resolves when tokens are refreshed
   * @throws {OpenIdError} If no OpenID config
   */
  async refreshTokens(refreshToken: string): Promise<void> {
    const openIdSecurityConfig = this.getOpenIdConfig();

    try {
      const data = await this.openIdRestService.refreshToken(refreshToken);
      this.logger.debug('OpenID: refreshed tokens');
      this.tokenUtils.saveTokens(data, openIdSecurityConfig);
      this.authenticationStorageService.setAuthToken(this.tokenUtils.authHeaderGraphDB());
      await this.setupTokensRefresh();
    } catch (error) {
      this.logger.debug('OpenID: could not refresh tokens', error);

      let errorMessage = 'unknown error';
      if (error instanceof HttpErrorResponse) {
        errorMessage = error.data?.error_description ?? 'unknown error';
      }

      const notification = Notification.error('openid.errors.cannot_refresh_token')
        .withTitle('openid.errors.title')
        .withParameters({error: errorMessage, [NotificationParam.SHOULD_TOAST]: true});
      notify(notification);

      this.softLogout();
      service(EventService).emit(new Logout());
    }
  }

  /**
   * Initializes OpenID authentication system.
   * Loads JWKS, checks authentication, and handles pending flows.
   * @returns {Promise<boolean>} True if authenticated, else false
   */
  async initializeOpenId(): Promise<boolean> {
    const openIdSecurityConfig = this.getOpenIdConfig();
    await this.initializeJsonWebKeySet();
    // Check existing authentication
    const isAuthValid = this.authFlowHandler.checkExistingAuthentication(openIdSecurityConfig);
    if (isAuthValid) {
      await this.setupTokensRefresh();
      return true;
    }

    // Handle authentication flow completion
    return this.handleAuthenticationFlow();
  }

  /**
   * Loads JWKS from provider and updates security context.
   * @returns {Promise<void>}
   */
  async initializeJsonWebKeySet(): Promise<void> {
    const jwks = await this.getJSONWebKeySet();
    const keySet = this.buildKeySet(jwks.keys);
    this.securityContextService.updateJsonWebKeysSet(keySet);
  }

  // Authentication flow setup methods

  /**
   * Starts authorization code flow with PKCE.
   * Stores state and redirects to provider login.
   * @param {string} state - CSRF protection state
   * @param {string} returnToUrl - Redirect URI after login
   */
  setupCodeFlow(state: string, returnToUrl: string): void {
    this.authFlowHandler.storeCodeFlowData(state);
    const codeChallenge = this.authFlowHandler.getCodeChallengeForCodeFlow();
    const loginUrl = this.getLoginUrl(state, codeChallenge, returnToUrl);
    this.redirectToUrl(loginUrl);
  }

  /**
   * Starts authorization code flow without PKCE.
   * Clears PKCE verifier and redirects to login.
   * @param {string} state - CSRF protection state
   * @param {string} returnToUrl - Redirect URI after login
   */
  setupCodeNoPkceFlow(state: string, returnToUrl: string): void {
    this.openidStorageService.clearPkceCodeVerifier();
    const loginUrl = this.getLoginUrl(state, '', returnToUrl);
    this.redirectToUrl(loginUrl);
  }

  /**
   * Starts implicit flow for OpenID authentication.
   * Stores nonce and redirects to provider login.
   * @param {string} state - Nonce and CSRF protection state
   * @param {string} returnToUrl - Redirect URI after login
   */
  setupImplicitFlow(state: string, returnToUrl: string): void {
    this.openidStorageService.setNonce(state);
    const loginUrl = this.getLoginUrl(state, '', returnToUrl);
    this.redirectToUrl(loginUrl);
  }

  // Token management

  /**
   * Sets up automatic token refresh based on expiration.
   * @returns {Promise<void>}
   */
  async setupTokensRefresh(): Promise<void> {
    await this.tokenRefreshManager.setupTokensRefresh(this.refreshTokens.bind(this));
  }

  // Authentication management

  /**
   * Clears authentication data, tokens, and refresh timers.
   */
  clearAuthentication(): void {
    this.authenticationStorageService.clearAuthToken();
    this.tokenUtils.clearTokens();
    this.tokenRefreshManager.clearRefreshTimer();
  }

  /**
   * Initiates logout by clearing authentication.
   */
  logout(logoutFromIDP = false): void {
    if (logoutFromIDP) {
      this.hardLogout(getOrigin());
    } else {
      this.softLogout();
    }
  }

  // Private helper methods

  /**
   * Gets OpenID security config from context.
   * @returns {OpenidSecurityConfig} OpenID config
   * @throws {OpenIdError} If no config
   */
  private getOpenIdConfig(): OpenidSecurityConfig {
    const openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
    if (!openIdSecurityConfig) {
      throw new MissingOpenidConfiguration();
    }
    return openIdSecurityConfig;
  }

  /**
   * Builds a key set mapping from key ID to key object.
   * @param {Array<{ kid: string }>} keys - JWKS keys
   * @returns {Record<string, JsonWebKey & { kid: string }>} Key set
   */
  private buildKeySet(keys: JsonWebKey & { kid: string }[]): Record<string, JsonWebKey & { kid: string }> {
    const keySet: Record<string, JsonWebKey & { kid: string }> = {};
    keys.forEach((key) => {
      keySet[key.kid] = key;
    });
    return keySet;
  }

  /**
   * Handles completion of authentication flow.
   * Processes query params and exchanges codes/tokens.
   * @returns {Promise<boolean>} True if authenticated
   */
  private async handleAuthenticationFlow(): Promise<boolean> {
    const config = this.getOpenIdConfig();
    this.clearAuthentication();

    const isImplicitFlow = config.authFlow === OpenIdAuthFlowType.IMPLICIT;
    const queryParams: AuthFlowParams = OpenIdUtils.parseQueryString(isImplicitFlow);

    if (queryParams.code) {
      return this.authFlowHandler.handleAuthorizationCode(config, queryParams, this.exchangeTokensForCode.bind(this));
    }

    if (queryParams.id_token) {
      await this.authFlowHandler.handleImplicitFlow(config, queryParams);
      await this.setupTokensRefresh();
      return true;
    }

    return false;
  }

  /**
   * Exchanges authorization code for tokens and saves them.
   * Used as callback in code flow.
   * @param {string} code - Authorization code
   * @param {string} redirectUrl - Redirect URI
   * @param {string | null} [codeVerifier] - PKCE code verifier (optional)
   * @returns {Promise<void>}
   * @throws {OpenIdError} If no config or token exchange fails
   */
  private async exchangeTokensForCode(code: string, redirectUrl: string, codeVerifier?: string | null): Promise<void> {
    const openIdSecurityConfig = this.getOpenIdConfig();

    try {
      const data = await this.getTokens(redirectUrl, code, codeVerifier);
      this.logger.debug('OpenID: successfully retrieved tokens');
      this.tokenUtils.saveTokens(data, openIdSecurityConfig);
      await this.setupTokensRefresh();
    } catch (e) {
      this.logger.error('OpenID: Cannot retrieve token after login', {error: e});

      const notification = Notification.error('openid.errors.cannot_retrieve_token')
        .withTitle('openid.errors.title')
        .withParameters({error: e instanceof Error ? e.message : String(e), [NotificationParam.SHOULD_TOAST]: true});
      notify(notification);

      throw new OpenIdError('Cannot retrieve token after login');
    }
  }

  /**
   * Clears authentication data.
   */
  private softLogout(): void {
    this.clearAuthentication();
  }

  /**
   * Performs hard logout and redirects to provider's logout endpoint.
   * @param {string} redirectUrl - Redirect URI after logout
   */
  private hardLogout(redirectUrl: string): void {
    this.softLogout();
    const logoutUrl = this.getLogoutUrl(redirectUrl);
    this.redirectToUrl(logoutUrl);
  }

  /**
   * Redirects browser to specified URL.
   * @param {string} url - Target URL
   */
  private redirectToUrl(url: string): void {
    WindowService.setLocationHref(url);
  }

  /**
   * Builds login URL for OpenID provider.
   * @param {string} state - CSRF protection state
   * @param {string} codeChallenge - PKCE code challenge
   * @param {string} redirectUrl - Redirect URI after login
   * @returns {string} Login URL
   * @throws {OpenIdError} If no config
   */
  private getLoginUrl(state: string, codeChallenge: string, redirectUrl: string): string {
    return this.openIdUrlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);
  }

  /**
   * Builds logout URL for OpenID provider.
   * @param {string} redirectUrl - Redirect URI after logout
   * @returns {string} Logout URL
   */
  private getLogoutUrl(redirectUrl: string): string {
    return this.openIdUrlBuilder.buildLogoutUrl(redirectUrl);
  }
}
