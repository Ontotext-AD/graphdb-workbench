import {service} from '../../../providers';
import {AuthenticationService, AuthenticationStorageService, OpenidStorageService, SecurityContextService, SecurityService} from '../../../services/security';
import {LoggerProvider} from '../../logging/logger-provider';
import {OpenIdService} from '../openid/openid-service';
import {getOrigin} from '../../utils';
import {AuthStrategy, AuthStrategyType, OpenIdAuthFlowType} from '../../../models/security/authentication';
import {OpenidTokenUtils} from '../openid/openid-token-utils';
import {AuthenticatedUser, OpenidSecurityConfig} from '../../../models/security';
import {OntoToastrService} from '../../toastr';
import {GeneratorUtils} from '../../utils/generator-utils';
import {MissingOpenidConfiguration} from '../errors/openid/missing-openid-configuration';
import {InvalidOpenidAuthFlow} from '../errors/openid/invalid-openid-auth-flow';

// Constants for better maintainability
const ERRORS = {
  CONFIG_NOT_FOUND: 'OpenID configuration not found',
  UNKNOWN_FLOW: 'openid.auth.unknown.flow',
  INIT_FAILED: 'Could not initialize OpenID authentication',
  USER_LOAD_FAILED: 'Could not load authenticated user'
} as const;

/**
 * OpenID Connect authentication provider implementation.
 *
 * Handles OpenID Connect authentication flows including authorization code,
 * authorization code without PKCE, and implicit flows. Manages the complete
 * authentication lifecycle from initialization through login and logout.
 */
export class OpenidAuthProvider implements AuthStrategy {
  private readonly logger = LoggerProvider.logger;
  private readonly securityService = service(SecurityService);
  private readonly authenticationStorageService = service(AuthenticationStorageService);
  private readonly authenticationService = service(AuthenticationService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly openIdService = service(OpenIdService);
  private readonly openidStorageService = service(OpenidStorageService);
  private readonly tokenUtils = service(OpenidTokenUtils);
  private readonly toasterService = service(OntoToastrService);

  type = AuthStrategyType.OPENID;
  private openIdSecurityConfig: OpenidSecurityConfig | undefined;

  /**
   * Creates a new OpenIdAuthProvider and sets up configuration listeners.
   */
  constructor() {
    this.setupConfigurationListener();
  }

  /**
   * Initializes the OpenID authentication provider.
   * @returns Promise resolving to true if user is logged in
   * @throws Error if configuration is missing or initialization fails
   */
  async initialize(): Promise<boolean> {
    this.loadSecurityConfiguration();
    this.validateConfiguration();
    try {
      const isLoggedIn = await this.openIdService.initializeOpenId();

      if (isLoggedIn) {
        await this.handleSuccessfulAuthentication();
      }

      const returnToUrl = this.openidStorageService.getReturnUrl().getValue();
      this.openidStorageService.clearReturnUrl();

      if (isLoggedIn && returnToUrl) {
        window.singleSpa.navigateToUrl(returnToUrl);
      }
      return isLoggedIn;
    } catch (error) {
      this.handleAuthenticationError(error);
      return false;
    }
  }

  /**
   * Starts the OpenID Connect login flow.
   * @returns Promise that resolves when login flow is initiated
   * @throws Error if configuration is missing or flow type is unknown
   */
  login(): Promise<AuthenticatedUser> {
    this.validateConfiguration();

    const returnToUrl = this.getReturnUrl();
    const state = GeneratorUtils.generateRandomString(28);
    const authFlow = this.openIdSecurityConfig!.authFlow as OpenIdAuthFlowType;

    this.executeAuthFlow(authFlow, state, returnToUrl);
    return new Promise(() => {
      // Never resolves as user is redirected
    });
  }

  /**
   * Logs out the current user and clears authentication data.
   * @returns Promise that resolves when logout is complete
   */
  logout(): Promise<void> {
    this.openIdService.logout();
    return Promise.resolve();
  }

  /**
   * Checks if the user is currently authenticated.
   * @returns True if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    const token = this.authenticationStorageService.getAuthToken().getValue();
    return !this.authenticationService.isSecurityEnabled() || token !== null;
  }

  /**
   * Indicates that this strategy is not for external users.
   * @returns false, as this strategy is not for external authentication.
   */
  isExternal(): boolean {
    return false;
  }

  // Private helper methods for better organization and testability

  /**
   * Sets up listener for security configuration changes.
   * @private
   */
  private setupConfigurationListener(): void {
    this.securityContextService.onSecurityConfigChanged((config) => {
      if (config) {
        this.openIdSecurityConfig = config.openidSecurityConfig;
      }
    });
  }

  /**
   * Loads OpenID security configuration from security context.
   * @private
   */
  private loadSecurityConfiguration(): void {
    this.openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
  }

  /**
   * Validates that OpenID configuration is available.
   * @private
   * @throws Error if configuration is not found
   */
  private validateConfiguration(): void {
    if (!this.openIdSecurityConfig) {
      throw new MissingOpenidConfiguration();
    }
  }

  /**
   * Handles post-authentication setup for successful login.
   * @private
   */
  private async handleSuccessfulAuthentication(): Promise<void> {
    this.logger.debug('OpenID: authentication initialized');
    this.authenticationStorageService.setAuthToken(this.tokenUtils.authHeaderGraphDB());

    try {
      await this.loadAndSetAuthenticatedUser();
    } catch (error) {
      this.logger.error(ERRORS.USER_LOAD_FAILED, error);
      // Don't rethrow here as this is not critical for authentication success
    }
  }

  /**
   * Loads authenticated user and updates security context.
   * @private
   */
  private async loadAndSetAuthenticatedUser(): Promise<void> {
    const authenticatedUser = await this.securityService.getAuthenticatedUser();
    if (authenticatedUser) {
      this.securityContextService.updateAuthenticatedUser(authenticatedUser);
    }
  }

  /**
   * Handles authentication errors by logging and cleanup.
   * @private
   * @param error The error that occurred
   */
  private handleAuthenticationError(error: unknown): void {
    this.authenticationStorageService.clearAuthToken();
    this.logger.debug('OpenID: not logged or login error');
    this.logger.error(ERRORS.INIT_FAILED, error);
    this.openIdService.clearAuthentication();
  }

  /**
   * Gets the return URL for authentication redirect.
   * @private
   * @returns The return URL
   */
  private getReturnUrl(): string {
    // Must return to /login to finish the workflow
    return `${getOrigin()}login`;
  }

  /**
   * Executes the appropriate OpenID authentication flow.
   * @private
   * @param authFlow The authentication flow type
   * @param state Random state for CSRF protection
   * @param returnToUrl URL to redirect after authentication
   * @throws Error if flow type is unknown
   */
  private executeAuthFlow(authFlow: OpenIdAuthFlowType, state: string, returnToUrl: string): void {
    switch (authFlow) {
    case OpenIdAuthFlowType.CODE:
      this.openIdService.setupCodeFlow(state, returnToUrl);
      break;
    case OpenIdAuthFlowType.CODE_NO_PKCE:
      this.openIdService.setupCodeNoPkceFlow(state, returnToUrl);
      break;
    case OpenIdAuthFlowType.IMPLICIT:
      this.openIdService.setupImplicitFlow(state, returnToUrl);
      break;
    default:
      this.logger.debug(`OpenID: Invalid OpenID authentication flow: ${authFlow}`);
      // TODO: Show toaster with error message `openid.auth.unknown.flow: ${authFlow}` when GDB-13200 is done
      throw new InvalidOpenidAuthFlow(authFlow);
    }
  }
}
