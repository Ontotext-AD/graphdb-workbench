import {Service} from '../../providers/service/service';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';
import {ServiceProvider} from '../../providers';
import {EventService} from '../event-service';
import {Logout} from '../../models/events';
import {SecurityContextService} from './security-context.service';
import {AuthStrategy} from '../../models/security/authentication/auth-strategy';
import {GdbTokenAuthProvider} from '../../models/security/authentication/gdb-token-auth-provider';

/**
 * Service responsible for handling authentication-related operations.
 */
export class AuthenticationService implements Service {
  private readonly authStrategy: AuthStrategy = new GdbTokenAuthProvider();

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
    return this.authStrategy.login({username, password});
  }

  /**
   * Updates security context for logout request.
   */
  logout(): void {
    this.authStrategy.logout();
    ServiceProvider.get(EventService).emit(new Logout());
  }

  /**
   * Check if the user is authenticated.
   * A user is considered authenticated, if security is disabled, if he is external, or if there is an
   * auth token in the store
   */
  isAuthenticated() {
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
    return ServiceProvider.get(SecurityContextService).getSecurityConfig();
  }

  private getAuthenticatedUser(): AuthenticatedUser | undefined {
    return ServiceProvider.get(SecurityContextService).getAuthenticatedUser();
  }
}
