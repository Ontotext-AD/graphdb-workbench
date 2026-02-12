import {Service} from '../../providers/service/service';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';
import {service} from '../../providers';
import {EventService} from '../event-service';
import {Logout} from '../../models/events';
import {SecurityContextService} from './security-context.service';
import {AuthStrategyResolver} from './auth-strategy-resolver';
import {Login} from '../../models/events/auth/login';
import {getPathName, isLoginPage, navigateToLogin} from '../utils';
import {AuthorizationService} from './authorization.service';
import {AuthenticationStrategyNotSet} from './errors/authentication-strategy-not-set';
import {AuthStrategy} from '../../models/security/authentication';
import {AuthenticationStorageService} from './authentication-storage.service';
import {NavigationContextService} from '../navigation';

/**
 * Service responsible for handling authentication operations and managing auth strategies.
 *
 * Provides a unified interface for authentication regardless of the underlying strategy
 * (basic auth, OpenID Connect, etc.) and manages authentication state and events.
 */
export class AuthenticationService implements Service {
  private readonly eventService = service(EventService);
  private readonly authStrategyResolver = service(AuthStrategyResolver);
  private readonly authorizationService = service(AuthorizationService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authenticationStorageService = service(AuthenticationStorageService);
  private readonly navigationContextService = service(NavigationContextService);

  /**
   * Checks if an authentication strategy has been configured.
   * @returns True if strategy is set
   */
  isAuthenticationStrategySet(): boolean {
    return !!this.authStrategyResolver.getAuthStrategy();
  }

  getCurrentUser(): Promise<AuthenticatedUser> {
    const authStrategy = this.getAuthenticationStrategy();
    return authStrategy.fetchAuthenticatedUser();
  }

  /**
   * Authenticates the user with username and password.
   *
   * Stores the auth token (if returned), updates the security context
   * with the mapped user, and returns the authenticated user model.
   *
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns A Promise that resolves to the authenticated `AuthenticatedUser` model.
   */
  login(username: string, password: string): Promise<void> {
    const authStrategy = this.getAuthenticationStrategy();
    return authStrategy.login({username, password})
      .then((authUser) => {
        this.securityContextService.updateIsLoggedIn(true);
        this.securityContextService.updateAuthenticatedUser(authUser);
        // The previous strategy might have been external, which is why we need to update it
        this.updateStrategy();
        this.eventService.emit(new Login());
      });
  }

  /**
   * Logs out the current user and emits logout event.
   * Updates security context for logout request.
   */
  logout(): Promise<void> {
    const authStrategy = this.getAuthenticationStrategy();
    this.authenticationStorageService.setAuthenticated(false);
    const returnUrl = getPathName();
    return authStrategy.logout()
      .then(() => {
        if (!isLoginPage()) {
          this.navigationContextService.updateReturnUrl(returnUrl);
        }
        this.securityContextService.updateIsLoggedIn(false);
        if (this.authorizationService.hasFreeAccess()) {
          this.authorizationService.initializeFreeAccess();
          this.eventService.emit(new Login());
        } else {
          navigateToLogin();
          this.eventService.emit(new Logout());
        }
      });
  }

  /**
   * Checks if the user is logged in based on the provided configuration and user details.
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isLoggedIn(): boolean {
    const isUserLoggedIn = this.securityContextService.getIsLoggedIn() ?? false;
    const authenticatedUser = service(SecurityContextService).getAuthenticatedUser();
    return this.isSecurityEnabled() && isUserLoggedIn && !!authenticatedUser;
  }

  /**
   * Check if the user is authenticated.
   * A user is considered authenticated, if security is disabled, if he is external, or if there is an
   * auth token in the store
   *
   * @throws Error if authentication strategy is not set
   * @returns True if the user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    const authStrategy = this.getAuthenticationStrategy();
    return authStrategy.isAuthenticated();
  }

  /**
   * Checks if the current user is an external user (e.g., authenticated via Kerberos or X.509).
   * Each strategy is responsible for providing the external status of the {@link AuthenticatedUser}
   *
   * @returns {boolean} True if the user is external, false otherwise.
   * @Throws {@link AuthenticationStrategyNotSet}.if no strategy is set, when calling this method
   */
  isExternalUser(): boolean {
    const authStrategy = this.getAuthenticationStrategy();
    return authStrategy.isExternal();
  }

  /**
   * Checks if security is enabled
   * @returns True if security is enabled, false otherwise.
   */
  isSecurityEnabled(): boolean {
    return !!this.getSecurityConfig()?.isEnabled();
  }

  /**
   * Retrieves the current security configuration.
   * @private
   * @returns Current security config or undefined if not set
   */
  private getSecurityConfig(): SecurityConfig | undefined {
    return service(SecurityContextService).getSecurityConfig();
  }

  private updateStrategy(): void {
    const securityConfig = this.getSecurityConfig();
    if (securityConfig) {
      this.authStrategyResolver.resolveStrategy(securityConfig);
    }
  }

  private getAuthenticationStrategy(): AuthStrategy {
    const authStrategy = this.authStrategyResolver.getAuthStrategy();
    if (!authStrategy) {
      throw new AuthenticationStrategyNotSet();
    }
    return authStrategy;
  }
}
