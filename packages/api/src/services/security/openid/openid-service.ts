import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {OpenIdRestService} from './openid-rest-service';
import {SecurityContextService} from '../security-context.service';
import {LoggerProvider} from '../../logging/logger-provider';
import {OpenidSecurityConfig} from '../../../models/security';
import {OpenIdUrlBuilder} from './openid-url-builder';
import {OpenIdAuthFlowHandler} from './openid-auth-flow-handler';
import {OpenIdTokenRefreshManager} from './openid-token-refresh-manager';
import {AuthFlowParams, OpenIdAuthFlowType, OpenIdTokens} from '../../../models/security/authentication';
import {OpenidStorageService} from './openid-storage.service';
import {OpenidTokenUtils} from './openid-token-utils';
import {OpenIdUtils} from './openid-utils';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';
import {OpenIdError} from './errors/openid-error';

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
  private readonly authFlowHandler = new OpenIdAuthFlowHandler();
  private readonly tokenRefreshManager = new OpenIdTokenRefreshManager();

  // Public API methods

  /**
   * Retrieves the JSON Web Key Set (JWKS) from the OpenID provider.
   * The JWKS contains the public keys used to verify JWT tokens.
   *
   * @returns Promise resolving to an object containing an array of keys with their key IDs
   */
  getJSONWebKeySet(): Promise<{ keys: { kid: string }[] }> {
    return this.openIdRestService.getJSONWebKeySet();
  }

  /**
   * Exchanges an authorization code for access and refresh tokens.
   * Used in the authorization code flow after the user is redirected back from the provider.
   *
   * @param redirectUrl - The URL to redirect to after token exchange
   * @param code - The authorization code received from the OpenID provider
   * @param codeVerifier - Optional PKCE code verifier for enhanced security
   * @returns Promise resolving to the OpenID tokens (access, refresh, ID tokens)
   */
  getTokens(redirectUrl: string, code: string, codeVerifier?: string | null): Promise<OpenIdTokens> {
    return this.openIdRestService.getTokens(redirectUrl, code, codeVerifier);
  }

  /**
   * Refreshes expired access tokens using a valid refresh token.
   * Automatically saves the new tokens and sets up the next refresh cycle.
   *
   * @param refreshToken - The refresh token to use for obtaining new tokens
   * @returns Promise resolving to the refresh result indicating success or failure
   */
  async refreshTokens(refreshToken: string): Promise<void> {
    const openIdSecurityConfig = this.getOpenIdConfig();
    if (!openIdSecurityConfig) {
      throw new OpenIdError('No OpenID configuration');
    }

    try {
      const data = await this.openIdRestService.refreshToken(refreshToken);
      this.logger.debug('oidc: refreshed tokens');
      this.tokenUtils.saveTokens(data, openIdSecurityConfig);
      this.authenticationStorageService.setAuthToken(this.tokenUtils.authHeaderGraphDB());
      await this.setupTokensRefresh(true);
    } catch (error) {
      this.logger.debug('oidc: could not refresh tokens', error);
      this.softLogout();
      service(EventService).emit(new Logout());
    }
  }

  /**
   * Initializes the OpenID Connect authentication system.
   * Sets up the JSON Web Key Set, checks for existing authentication,
   * and handles any pending authentication flows.
   *
   * @param openIdSecurityConfig - The OpenID security configuration
   * @returns Promise resolving to true if authentication is successful, false otherwise
   */
  async initializeOpenId(openIdSecurityConfig: OpenidSecurityConfig): Promise<boolean> {
    await this.initializeJsonWebKeySet();

    // Check existing authentication
    const isAuthValid = this.authFlowHandler.checkExistingAuthentication(openIdSecurityConfig);
    if (isAuthValid) {
      await this.setupTokensRefresh();
      return true;
    }

    // Handle authentication flow completion
    return this.handleAuthenticationFlow(openIdSecurityConfig);
  }

  /**
   * Initializes the JSON Web Key Set by fetching it from the provider
   * and updating the security context with the key set for token verification.
   */
  async initializeJsonWebKeySet(): Promise<void> {
    const jwks = await this.getJSONWebKeySet();
    const keySet = this.buildKeySet(jwks.keys);
    this.securityContextService.updateJsonWebKeysSet(keySet);
  }

  // Authentication flow setup methods

  /**
   * Sets up the authorization code flow with PKCE (Proof Key for Code Exchange).
   * Stores the necessary state and redirects the user to the OpenID provider's login page.
   *
   * @param state - A random state parameter for CSRF protection
   * @param returnToUrl - The URL to return to after successful authentication
   */
  setupCodeFlow(state: string, returnToUrl: string): void {
    this.authFlowHandler.storeCodeFlowData(state);
    const codeChallenge = this.authFlowHandler.getCodeChallengeForCodeFlow();
    const loginUrl = this.getLoginUrl(state, codeChallenge, returnToUrl);
    this.redirectToUrl(loginUrl);
  }

  /**
   * Sets up the authorization code flow without PKCE.
   * Clears any existing PKCE code verifier and redirects to the login URL.
   *
   * @param state - A random state parameter for CSRF protection
   * @param returnToUrl - The URL to return to after successful authentication
   */
  setupCodeNoPkceFlow(state: string, returnToUrl: string): void {
    this.openidStorageService.clearPkceCodeVerifier();
    const loginUrl = this.getLoginUrl(state, '', returnToUrl);
    this.redirectToUrl(loginUrl);
  }

  /**
   * Sets up the implicit flow for OpenID authentication.
   * Stores a nonce for security and redirects to the provider's login page.
   *
   * @param state - A random state parameter that also serves as the nonce
   * @param returnToUrl - The URL to return to after successful authentication
   */
  setupImplicitFlow(state: string, returnToUrl: string): void {
    this.openidStorageService.setNonce(state);
    const loginUrl = this.getLoginUrl(state, '', returnToUrl);
    this.redirectToUrl(loginUrl);
  }

  // Token management

  /**
   * Sets up automatic token refresh to prevent token expiration.
   * Schedules the next refresh based on token expiration times.
   *
   * @param justGotTokens - Whether tokens were just obtained (affects timing calculations)
   */
  async setupTokensRefresh(justGotTokens = false): Promise<void> {
    await this.tokenRefreshManager.setupTokensRefresh(justGotTokens, this.refreshTokens.bind(this));
  }

  // Authentication management

  /**
   * Clears all authentication data including tokens and refresh timers.
   * Used when logging out or when authentication fails.
   */
  clearAuthentication(): void {
    this.authenticationStorageService.clearAuthToken();
    this.tokenUtils.clearTokens();
    this.tokenRefreshManager.clearRefreshTimer();
  }

  /**
   * Initiates a logout process by performing a hard logout to the current origin.
   * This will clear all tokens and redirect to the OpenID provider's logout endpoint.
   */
  logout(): void {
    this.softLogout();
  }

  // Private helper methods

  /**
   * Retrieves the OpenID security configuration from the security context.
   *
   * @returns The OpenID security configuration or undefined if not available
   */
  private getOpenIdConfig(): OpenidSecurityConfig | undefined {
    return this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
  }

  /**
   * Builds a key set object from an array of JSON Web Keys.
   * Creates a mapping from key ID to key object for efficient lookups.
   *
   * @param keys - Array of JSON Web Keys with key IDs
   * @returns Object mapping key IDs to their corresponding keys
   */
  private buildKeySet(keys: { kid: string }[]): Record<string, JsonWebKey & { kid: string }> {
    const keySet: Record<string, JsonWebKey & { kid: string }> = {};
    keys.forEach((key) => {
      keySet[key.kid] = key;
    });
    return keySet;
  }

  /**
   * Handles the completion of an authentication flow by processing query parameters
   * and exchanging authorization codes or handling implicit flow tokens.
   *
   * @param config - The OpenID security configuration
   * @returns Promise resolving to true if authentication is successful, false otherwise
   */
  private async handleAuthenticationFlow(config: OpenidSecurityConfig): Promise<boolean> {
    this.clearAuthentication();

    const isImplicitFlow = config.authFlow === OpenIdAuthFlowType.IMPLICIT;
    const queryParams: AuthFlowParams = OpenIdUtils.parseQueryString(isImplicitFlow);

    if (queryParams.code) {
      return this.authFlowHandler.handleAuthorizationCode(config, queryParams, this.exchangeTokensForCode.bind(this));
    }

    if (queryParams.id_token) {
      await this.authFlowHandler.handleImplicitFlow(config, queryParams);
      await this.setupTokensRefresh(true);
      return true;
    }

    return false;
  }

  /**
   * Exchanges an authorization code for tokens and saves them.
   * Used as a callback in the authorization code flow handling.
   *
   * @param code - The authorization code to exchange
   * @param redirectUrl - The redirect URL used in the token exchange
   * @param codeVerifier - Optional PKCE code verifier
   * @throws Error if no OpenID configuration is available or token exchange fails
   */
  private async exchangeTokensForCode(code: string, redirectUrl: string, codeVerifier?: string | null): Promise<void> {
    const openIdSecurityConfig = this.getOpenIdConfig();
    if (!openIdSecurityConfig) {
      throw new OpenIdError('No OpenID configuration');
    }

    try {
      const data = await this.getTokens(redirectUrl, code, codeVerifier);
      this.logger.debug('oidc: successfully retrieved tokens');
      this.tokenUtils.saveTokens(data, openIdSecurityConfig);
      await this.setupTokensRefresh(true);
    } catch (e) {
      this.logger.error('oidc: openid.auth.cannot.retrieve.token.msg', {error: e});
      throw new OpenIdError('Cannot retrieve tokens');
    }
  }

  private softLogout(): void {
    this.clearAuthentication();
  }

  /**
   * Performs a hard logout by clearing all tokens and redirecting to the OpenID provider's logout endpoint.
   * Upon logout, the OpenID provider will redirect to the provided URL.
   *
   * @param redirectUrl - The URL to redirect to after logout is complete
   */
  private hardLogout(redirectUrl: string): void {
    this.softLogout();
    const openIdSecurityConfig = this.getOpenIdConfig();
    if (openIdSecurityConfig) {
      const logoutUrl = this.getLogoutUrl(openIdSecurityConfig, redirectUrl);
      this.redirectToUrl(logoutUrl);
    }
  }

  /**
   * Redirects the browser to the specified URL.
   *
   * @param url - The URL to redirect to
   */
  private redirectToUrl(url: string): void {
    window.location.href = url;
  }

  // URL building methods

  /**
   * Builds the login URL for the OpenID provider with the necessary parameters.
   *
   * @param state - The state parameter for CSRF protection
   * @param codeChallenge - The PKCE code challenge (empty string if not using PKCE)
   * @param redirectUrl - The URL to redirect to after login
   * @returns The complete login URL
   * @throws Error if no OpenID configuration is available
   */
  private getLoginUrl(state: string, codeChallenge: string, redirectUrl: string): string {
    const openIdSecurityConfig = this.getOpenIdConfig();
    if (!openIdSecurityConfig) {
      throw new OpenIdError('No OpenID configuration');
    }

    const urlBuilder = new OpenIdUrlBuilder(openIdSecurityConfig);
    return urlBuilder.buildLoginUrl(state, codeChallenge, redirectUrl);
  }

  /**
   * Builds the logout URL for the OpenID provider.
   *
   * @param openIdSecurityConfig - The OpenID security configuration
   * @param redirectUrl - The URL to redirect to after logout
   * @returns The complete logout URL
   */
  private getLogoutUrl(openIdSecurityConfig: OpenidSecurityConfig, redirectUrl: string): string {
    const urlBuilder = new OpenIdUrlBuilder(openIdSecurityConfig);
    return urlBuilder.buildLogoutUrl(redirectUrl);
  }
}
