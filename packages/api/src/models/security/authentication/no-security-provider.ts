import {AuthenticatedUser} from '../authenticated-user';
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

  initialize(): Promise<unknown> {
    return this.securityService.getAdminUser()
      .then((authenticatedUser) => {
        this.securityContextService.updateAuthenticatedUser(authenticatedUser);
      })
      .catch((error) => {
        this.logger.error('Could not load authenticated user', error);
      });
  }

  login(): Promise<AuthenticatedUser> {
    this.authStorageService.clearAuthToken();
    return this.securityService.getAdminUser()
      .then((adminUser) => {
        this.securityContextService.updateAuthenticatedUser(adminUser);
        return adminUser;
      });
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  isAuthenticated(): boolean {
    const authenticatedUser = this.securityContextService.getAuthenticatedUser();
    return !!authenticatedUser;
  }
}
