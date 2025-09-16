import {Service} from '../../providers/service/service';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';
import {ServiceProvider} from '../../providers';
import {EventService} from '../event-service';
import {Logout} from '../../models/events';
import {SecurityContextService} from './security-context.service';
import {SecurityService} from './security.service';
import {AuthenticationStorageService} from './authentication-storage.service';

/**
 * Service responsible for handling authentication-related operations.
 */
export class AuthenticationService implements Service {
  private readonly securityService = ServiceProvider.get(SecurityService);

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
  login(username: string, password: string): Promise<AuthenticatedUser> {
    return this.securityService.login(username, password);
  }

  /**
   * Updates security context for logout request.
   */
  logout(): void {
    ServiceProvider.get(EventService).emit(new Logout());
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
    const config = this.getSecurityConfig();
    const user = this.getAuthenticatedUser();
    return !config?.enabled
      || user?.external
      // eslint-disable-next-line eqeqeq
      || ServiceProvider.get(AuthenticationStorageService).getAuthToken().getValue() != null;
  }

  /**
   * Checks if security is enabled
   * @returns {boolean} True if security is enabled, false otherwise.
   */
  isSecurityEnabled(): boolean {
    return !!this.getSecurityConfig()?.enabled;
  }

  private getSecurityConfig(): SecurityConfig | undefined {
    return ServiceProvider.get(SecurityContextService).getSecurityConfig();
  }

  private getAuthenticatedUser(): AuthenticatedUser | undefined {
    return ServiceProvider.get(SecurityContextService).getAuthenticatedUser();
  }
}
