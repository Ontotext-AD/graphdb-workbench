import {AuthenticatedUser} from '../authenticated-user';
import {AuthStrategy} from './auth-strategy';
import {AuthStrategyType} from './auth-strategy-type';
import {MapperProvider, service} from '../../../providers';
import {AuthenticatedUserMapper, AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../services/security';
import {LoggingService} from '../../../services/logging/logging.service';

type LoginData = {
  username: string;
  password: string;
}

export class GdbTokenAuthProvider implements AuthStrategy {
  private readonly logger = LoggingService.logger;
  private readonly securityService = service(SecurityService);
  private readonly authStorageService = service(AuthenticationStorageService);
  private readonly securityContextService = service(SecurityContextService);

  type = AuthStrategyType.GDB_TOKEN;

  initialize(): Promise<unknown> {
    return Promise.resolve();
  }

  async login(loginData: LoginData): Promise<AuthenticatedUser> {
    const {username, password} = loginData;
    const response = await this.securityService.loginGdbToken(username, password);

    const authHeader = this.getAuthenticationHeader(response);
    let authUser;
    try {
      authUser = await this.getUserFromResponse(response);
    } catch (e) {
      this.logger.error('Could not map user from response', e);
      throw new Error('Failed to map user from response');
    }

    if (authHeader && authUser) {
      this.authStorageService.setAuthToken(authHeader);
      this.securityContextService.updateAuthenticatedUser(authUser);
    }
    return authUser;
  }

  private getAuthenticationHeader(response: Response): string | null {
    return response.headers.get('authorization');
  }

  private async getUserFromResponse(response: Response): Promise<AuthenticatedUser> {
    const responseData = await response.json();
    return MapperProvider.get(AuthenticatedUserMapper).mapToModel(responseData);
  }

  logout(): Promise<void> {
    this.authStorageService.clearAuthToken();
    return Promise.resolve();
  }

  isAuthenticated(): boolean {
    const securityConfig = this.securityContextService.getSecurityConfig();
    const token = this.authStorageService.getAuthToken().getValue();
    return !securityConfig?.enabled || token !== null;
  }
}
