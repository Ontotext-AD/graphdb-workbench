import {AuthStrategy} from './auth-strategy';
import {AuthStrategyType} from './auth-strategy-type';
import {service} from '../../../providers';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../services/security';
import {LoggerProvider} from '../../../services/logging/logger-provider';

export class NoSecurityProvider implements AuthStrategy {
  private readonly logger = LoggerProvider.logger;
  private readonly securityService = service(SecurityService);
  private readonly authStorageService = service(AuthenticationStorageService);
  private readonly securityContextService = service(SecurityContextService);

  type = AuthStrategyType.NO_SECURITY;

  /**
   * Initializes the NoSecurityProvider and loads the admin user.
   *
   * @returns A promise that resolves when the initialization is complete.
   */
  initialize(): Promise<unknown> {
    return this.securityService.getAdminUser()
      .then((authenticatedUser) => {
        this.securityContextService.updateAuthenticatedUser(authenticatedUser);
      })
      .catch((error) => {
        this.logger.error('Could not load authenticated user', error);
      });
  }

  /**
   * Logs in a user. In the NoSecurityProvider, this method does nothing and resolves immediately.
   */
  login(): Promise<void> {
    return Promise.resolve();
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
}
