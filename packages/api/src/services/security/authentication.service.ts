import {Service} from '../../providers/service/service';
import {SecurityConfig} from '../../models/security';
import {service} from '../../providers';
import {EventService} from '../event-service';
import {Logout} from '../../models/events';
import {SecurityContextService} from './security-context.service';
import {AuthStrategy} from '../../models/security/authentication/auth-strategy';
import {AuthStrategyResolver} from './auth-strategy-resolver';
import {Login} from '../../models/events/auth/login';

/**
 * Service responsible for handling authentication-related operations.
 */
export class AuthenticationService implements Service {
  private readonly eventService = service(EventService);
  private readonly authStrategyResolver = service(AuthStrategyResolver);
  private authStrategy: AuthStrategy | undefined;

  setAuthenticationStrategy(securityConfig: SecurityConfig): void {
    this.authStrategy = this.authStrategyResolver.resolveStrategy(securityConfig);
    this.authStrategy.initialize();
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
    return !!(config?.enabled && config?.userLoggedIn);
  }

  /**
   * Check if the user is authenticated.
   * A user is considered authenticated, if security is disabled, if he is external, or if there is an
   * auth token in the store
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

  private getSecurityConfig(): SecurityConfig | undefined {
    return service(SecurityContextService).getSecurityConfig();
  }
}
