import {Service} from '../../providers/service/service';
import {AuthenticatedUser, Authority, SecurityConfig} from '../../models/security';
import {ServiceProvider} from '../../providers';
import {EventService} from '../event-service';
import {Logout} from '../../models/events';
import {SecurityContextService} from './security-context.service';

/**
 * Service responsible for handling authentication-related operations.
 */
export class AuthenticationService implements Service {
  login(): string {
    return 'Authentication.login from the API';
  }

  /**
   * Updates security context for logout request.
   */
  logout(): void {
    ServiceProvider.get(EventService).emit(new Logout());
  }

  // TODO: get security config and authenticated user synchronously from context
  /**
   * Checks if the user is authenticated based on the provided configuration and user details.
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    const config = this.getSecurityConfig();
    return !!(config?.enabled && config?.userLoggedIn);
  }

  /**
   * Determines if free access is allowed based on the security configuration.
   * @returns {boolean | undefined} True if free access is enabled, false or undefined otherwise.
   */
  hasFreeAccess(): boolean | undefined {
    const config = this.getSecurityConfig();
    return config?.enabled && config?.freeAccessActive;
  }

  /**
   * Checks if the user has a specific role based on the provided authority, configuration, and user details.
   * @param {Authority} role - The authority role to check.
   * @param {SecurityConfig} [config] - The security configuration object.
   * @param {AuthenticatedUser} [user] - The authenticated user object.
   * @returns {boolean | undefined} True if the user has the specified role, false or undefined otherwise.
   */
  hasRole(role?: Authority, config?: SecurityConfig, user?: AuthenticatedUser): boolean | undefined {
    if (!role || !config?.enabled) {
      return true;
    }
    const hasPrinciple = Object.keys(user || {}).length > 0;
    if (!hasPrinciple) {
      return false;
    }
    return Authority.IS_AUTHENTICATED_FULLY === role || user?.authorities.hasAuthority(role);
  }

  /**
   * Checks if security is enabled.
   * @returns {boolean} True if security is enabled, false otherwise.
   */
  isSecurityEnabled(): boolean {
    return !!this.getSecurityConfig()?.enabled;
  }

  private getSecurityConfig(): SecurityConfig | undefined {
    return ServiceProvider.get(SecurityContextService).getSecurityConfig();
  }
}
