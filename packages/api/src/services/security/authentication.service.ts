import {Service} from '../../providers/service/service';
import {SecurityConfig} from '../../models/security';
import {service} from '../../providers';
import {EventService} from '../event-service';
import {Logout} from '../../models/events';
import {SecurityContextService} from './security-context.service';
import {AuthStrategy} from '../../models/security/authentication';
import {AuthStrategyResolver} from './auth-strategy-resolver';
import {Login} from '../../models/events/auth/login';
import {isLoginPage, navigate} from '../utils';
import {AuthorizationService} from './authorization.service';
import {MissingAuthStrategyError} from './errors/missing-auth-strategy-error';

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
  private authStrategy: AuthStrategy | undefined;
  private isUserLoggedIn = false;

  /**
   * Sets and initializes the authentication strategy based on security configuration.
   * @param securityConfig Configuration determining which auth strategy to use
   * @returns Promise that resolves when strategy is initialized
   */
  setAuthenticationStrategy(securityConfig: SecurityConfig): Promise<void> {
    this.authStrategy = this.authStrategyResolver.resolveStrategy(securityConfig);
    return this.authStrategy.initialize().then((isLoggedIn) => {
      this.isUserLoggedIn = isLoggedIn;
      if (!isLoggedIn) {
        if (this.authorizationService.hasFreeAccess()) {
          this.authorizationService.initializeFreeAccess();
        } else if (securityConfig.hasOverrideAuth()) {
          this.authorizationService.initializeOverrideAuth();
        }
      }

      if (isLoginPage() && ((isLoggedIn || this.authorizationService.hasFreeAccess()) && !this.isExternalUser())) {
        navigate('/');
        this.eventService.emit(new Login());
      } else if (isLoginPage() && !isLoggedIn) {
        // stay on login page
      } else if (this.authorizationService.hasFreeAccess() || isLoggedIn) {
        this.eventService.emit(new Login());
      }
    });
  }

  /**
   * Checks if an authentication strategy has been configured.
   * @returns True if strategy is set
   */
  isAuthenticationStrategySet(): boolean {
    return !!this.authStrategy;
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
    if (!this.authStrategy) {
      throw new Error('Authentication strategy not set');
    }
    return this.authStrategy.login({username, password})
      .then((authUser) => {
        this.isUserLoggedIn = true;
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
    if (!this.authStrategy) {
      throw new Error('Authentication strategy not set');
    }
    return this.authStrategy.logout()
      .then(() => {
        this.isUserLoggedIn = false;
        if (this.authorizationService.hasFreeAccess()) {
          this.authorizationService.initializeFreeAccess();
          this.eventService.emit(new Login());
        } else {
          navigate('/login');
          this.eventService.emit(new Logout());
        }
      });
  }

  /**
   * Checks if the user is logged in based on the provided configuration and user details.
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isLoggedIn(): boolean {
    const authenticatedUser = service(SecurityContextService).getAuthenticatedUser();
    return this.isSecurityEnabled() && this.isUserLoggedIn && !!authenticatedUser;
  }

  /**
   * Check if the user is authenticated.
   * A user is considered authenticated, if security is disabled, if he is external, or if there is an
   * auth token in the store
   *
   * @throws Error if authentication strategy is not set
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isAuthenticated() {
    if (!this.authStrategy) {
      throw new MissingAuthStrategyError();
    }
    return !this.isSecurityEnabled() || this.authStrategy.isAuthenticated() || this.isExternalUser();
  }

  /**
   * Checks if the current user is an external user (e.g., authenticated via Kerberos or X.509).
   * An external user is defined as a logged-in user without a local auth token when security is enabled.
   *
   * @returns {boolean} True if the user is external, false otherwise. Defaults to false if no auth strategy is set.
   */
  isExternalUser(): boolean {
    if (!this.authStrategy) {
      throw new MissingAuthStrategyError();
    }
    return this.authStrategy.isExternal();
  }

  /**
   * Checks if security is enabled
   * @returns {boolean} True if security is enabled, false otherwise.
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
      this.authStrategy = this.authStrategyResolver.resolveStrategy(securityConfig);
    }
  }
}
