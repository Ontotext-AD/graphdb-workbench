import {AuthenticatedUser} from '../authenticated-user';
import {AuthStrategy} from './auth-strategy';
import {AuthStrategyType} from './auth-strategy-type';
import {service} from '../../../providers';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../services/security';

export class NoSecurityProvider implements AuthStrategy {
  private readonly securityService = service(SecurityService);
  private readonly authStorageService = service(AuthenticationStorageService);
  private readonly securityContextService = service(SecurityContextService);

  type = AuthStrategyType.GDB_TOKEN;

  initialize(): Promise<unknown> {
    return Promise.resolve();
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
    return true;
  }
}
