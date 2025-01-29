import {Service} from '../../providers/service/service';
import {AuthenticatedUser, Authority, SecurityConfig} from '../../models/security';
import {ServiceProvider} from '../../providers';
import {AuthenticationStorageService} from './authentication-storage.service';

/**
 * Service responsible for handling authentication-related operations.
 */
export class AuthenticationService implements Service {
  login(): string {
    return 'Authentication.login from the API';
  }

  // TODO: get security config and authenticated user synchronously from context
  /**
   * Checks if the user is authenticated based on the provided configuration and user details.
   * @param {SecurityConfig} [config] - The security configuration object.
   * @param {AuthenticatedUser} [user] - The authenticated user object.
   * @returns {boolean} True if the user is authenticated, false otherwise.
   */
  isAuthenticated(config?: SecurityConfig, user?: AuthenticatedUser): boolean {
    return !config?.enabled
      || user?.external
      // eslint-disable-next-line eqeqeq
      || ServiceProvider.get(AuthenticationStorageService).getAuthToken().getValue() != null;
  }

  /**
   * Determines if free access is allowed based on the security configuration.
   * @param {SecurityConfig} [config] - The security configuration object.
   * @returns {boolean | undefined} True if free access is enabled, false or undefined otherwise.
   */
  hasFreeAccess(config?: SecurityConfig): boolean | undefined {
    return config?.enabled && config?.freeAccess?.enabled;
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
}
