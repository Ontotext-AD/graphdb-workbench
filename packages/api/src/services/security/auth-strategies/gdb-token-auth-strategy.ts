import {service} from '../../../providers';
import {SecurityContextService} from '../../../services/security';
import {getCurrentRoute} from '../../utils';
import {AuthStrategyType} from '../../../models/security/authentication';
import {BaseGdbLoginStrategy} from './base-gdb-login-strategy';
import {AuthenticatedUser} from '../../../models/security';

export class GdbTokenAuthStrategy extends BaseGdbLoginStrategy {
  private readonly securityContextService = service(SecurityContextService);

  type = AuthStrategyType.GDB_TOKEN;

  /**
   * Initializes the authentication strategy. If the current route is 'login', resolves immediately.
   * Otherwise, attempts to load the authenticated user and update the security context.
   * Logs an error if the user cannot be loaded.
   * @returns Promise resolving to true if user is logged in
   * */
  initialize(): Promise<boolean> {
    const isAuthValid = !!this.authStorageService.getAuthToken().getValue();

    if (!isAuthValid) {
      return Promise.resolve(false);
    }

    if (this.isCurrentRouteLogin()) {
      return Promise.resolve(isAuthValid);
    }

    return this.fetchAuthenticatedUser()
      .then((authenticatedUser) => {
        if (authenticatedUser) {
          this.securityContextService.updateAuthenticatedUser(authenticatedUser);
        }
        return true;
      })
      .catch((error) => {
        this.logger.error('Could not load authenticated user', error);
        return false;
      });
  }

  /**
   * Fetches the currently authenticated user using the security service.
   *
   * @returns A promise that resolves to the authenticated user.
   */
  fetchAuthenticatedUser(): Promise<AuthenticatedUser> {
    return this.securityService.getAuthenticatedUser();
  }

  /**
   * Logs out the current user by clearing the authentication token.
   * @returns {Promise<void>} A promise that resolves when logout is complete.
   */
  logout(): Promise<void> {
    this.authStorageService.clearAuthToken();
    return Promise.resolve();
  }

  /**
   * Checks if the user is authenticated.
   * Returns true if security is disabled or if an authentication token is present.
   * @returns {boolean} True if authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    const token = this.authStorageService.getAuthToken().getValue();
    return token !== null;
  }

  /**
   * Indicates that this strategy is not for external users.
   * @returns false, as this strategy is not for external authentication.
   */
  isExternal(): boolean {
    return false;
  }

  private isCurrentRouteLogin(): boolean {
    return getCurrentRoute() === 'login';
  }
}
