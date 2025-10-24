import {service} from '../../../providers';
import {SecurityContextService, SecurityService} from '../../../services/security';
import {LoggerProvider} from '../../logging/logger-provider';
import {AuthStrategy} from '../../../models/security/authentication';
import {AuthStrategyType} from '../../../models/security/authentication';
import {AuthenticatedUser} from '../../../models/security';

export class NoSecurityProvider implements AuthStrategy {
  private readonly logger = LoggerProvider.logger;
  private readonly securityService = service(SecurityService);
  private readonly securityContextService = service(SecurityContextService);

  type = AuthStrategyType.NO_SECURITY;

  /**
   * Initializes the NoSecurityProvider and loads the admin user.
   *
   * @returns Promise resolving to true if user is logged in
   * */
  initialize(): Promise<boolean> {
    return this.securityService.getAdminUser()
      .then((authenticatedUser) => {
        this.securityContextService.updateAuthenticatedUser(authenticatedUser);
        return true;
      })
      .catch((error) => {
        this.logger.error('Could not load authenticated user', error);
        return false;
      });
  }

  /**
   * Logs in a user. In the NoSecurityProvider, this method does nothing and resolves immediately.
   */
  login(): Promise<AuthenticatedUser> {
    return this.securityService.getAdminUser();
  }

  /**
   * Logs out the current user. In the NoSecurityProvider, this method does nothing and resolves immediately.
   */
  logout(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Checks if a user is currently authenticated.
   *
   * @returns True if a user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    const authenticatedUser = this.securityContextService.getAuthenticatedUser();
    return !!authenticatedUser;
  }

  /**
   * Indicates that this strategy is not for external users.
   * @returns false, as this strategy is not for external authentication.
   */
  isExternal(): boolean {
    return false;
  }
}
