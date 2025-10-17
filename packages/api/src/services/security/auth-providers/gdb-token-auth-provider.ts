import {MapperProvider, service} from '../../../providers';
import {AuthenticatedUserMapper, AuthenticationService, AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../services/security';
import {LoggerProvider} from '../../logging/logger-provider';
import {getCurrentRoute} from '../../utils';
import {AuthStrategy} from '../../../models/security/authentication';
import {AuthStrategyType} from '../../../models/security/authentication';
import {AuthenticatedUser} from '../../../models/security';
import {MissingTokenInHeader} from '../errors/missing-token-in-header';

type LoginData = {
  username: string;
  password: string;
}

export class GdbTokenAuthProvider implements AuthStrategy {
  private readonly logger = LoggerProvider.logger;
  private readonly securityService = service(SecurityService);
  private readonly authStorageService = service(AuthenticationStorageService);
  private readonly authenticationService = service(AuthenticationService);
  private readonly securityContextService = service(SecurityContextService);

  type = AuthStrategyType.GDB_TOKEN;

  /**
   * Initializes the authentication provider. If the current route is 'login', resolves immediately.
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

    return this.securityService.getAuthenticatedUser()
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
   * Attempts to log in using the provided username and password.
   * On success, stores the authentication token and updates the authenticated user in the security context.
   * Logs and throws an error if the user cannot be mapped from the response.
   * @param {LoginData} loginData - The login credentials (username and password).
   * @returns {Promise<void>} A promise that resolves when login is complete.
   */
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

    if (authHeader) {
      this.authStorageService.setAuthToken(authHeader);
    } else {
      throw new MissingTokenInHeader();
    }
    return authUser;
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

  private isCurrentRouteLogin(): boolean {
    return getCurrentRoute() === 'login';
  }

  private getAuthenticationHeader(response: Response): string | null {
    return response.headers.get('authorization');
  }

  private async getUserFromResponse(response: Response): Promise<AuthenticatedUser> {
    const responseData = await response.json();
    return MapperProvider.get(AuthenticatedUserMapper).mapToModel(responseData);
  }
}
