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

/**
 * Service responsible for handling authentication operations and managing auth strategies.
 *
 * Provides a unified interface for authentication regardless of the underlying strategy
 * (basic auth, OpenID Connect, etc.) and manages authentication state and events.
 */
export class AuthenticationService implements Service {
  private readonly eventService = service(EventService);
  private readonly authStrategyResolver = service(AuthStrategyResolver);
  private authStrategy: AuthStrategy | undefined;

  /**
   * Sets and initializes the authentication strategy based on security configuration.
   * @param securityConfig Configuration determining which auth strategy to use
   * @returns Promise that resolves when strategy is initialized
   */
  setAuthenticationStrategy(securityConfig: SecurityConfig): Promise<void> {
    this.authStrategy = this.authStrategyResolver.resolveStrategy(securityConfig);
    return this.authStrategy.initialize().then((isLoggedIn) => {
      if (isLoginPage() && (isLoggedIn || securityConfig.freeAccess?.enabled)) {
        navigate('/');
        this.eventService.emit(new Login());
      } else if (isLoginPage() && !isLoggedIn) {
        // stay on login page
      } else if (securityConfig.freeAccess?.enabled) {
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
      .then(() => {
        this.eventService.emit(new Login());
      });
  }

  /**
   * Logs out the current user and emits logout event.
   * Updates security context for logout request.
   */
  logout(): void {
    if (!this.authStrategy) {
      throw new Error('Authentication strategy not set');
    }
    this.authStrategy.logout();
    service(EventService).emit(new Logout());
  }

  /**
   * Checks if the user is logged in based on the provided configuration and user details.
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isLoggedIn(): boolean {
    const config = this.getSecurityConfig();
    const authenticatedUser = service(SecurityContextService).getAuthenticatedUser();
    return !!(config?.enabled && config?.userLoggedIn) || !!authenticatedUser?.username;
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
      throw new Error('Authentication strategy not set');
    }
    return this.authStrategy.isAuthenticated();
  }

  /**
   * Checks if security is enabled
   * @returns {boolean} True if security is enabled, false otherwise.
   */
  isSecurityEnabled(): boolean {
    return !!this.getSecurityConfig()?.enabled;
  }

  /**
   * Retrieves the current security configuration.
   * @private
   * @returns Current security config or undefined if not set
   */
  private getSecurityConfig(): SecurityConfig | undefined {
    return service(SecurityContextService).getSecurityConfig();
  }
}
