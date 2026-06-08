import {service} from '../../../../providers';
import {AuthenticationStorageService, mapAuthenticatedUserResponseToModel, SecurityContextService, SecurityService} from '../index';
import {getCurrentRoute} from '../../../utils';
import {AuthStrategy, AuthStrategyType} from '../../../../models/security/authentication';
import {AuthenticatedUser, AuthenticatedUserResponse} from '../../../../models/security';
import {LoginData} from '../../../../models/security/authentication/login-data';
import {MissingTokenInHeader} from '../errors/missing-token-in-header';
import {HttpResponse} from '../../../../models/http';
import {InvalidLoginData} from '../errors/invalid-login-data';

export class GdbTokenAuthStrategy implements AuthStrategy {
  private readonly securityService = service(SecurityService);
  private readonly authStorageService = service(AuthenticationStorageService);
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

    // This strategy presumes enabled security. In this case the authenticated user is retrieved upon bootstrap
    return Promise.resolve(!!this.securityContextService.getAuthenticatedUser());
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
   * Attempts to log in using the provided username and password.
   * On success, stores the authentication token and updates the authenticated user in the security context.
   * Logs and throws an error if the user cannot be mapped from the response.
   * @param {LoginData} loginData - The login credentials (username and password).
   * @returns {Promise<void>} A promise that resolves when login is complete.
   */
  async login(loginData: LoginData): Promise<AuthenticatedUser> {
    this.assertIsLoginData(loginData);

    const {username, password} = loginData;
    const response = await this.securityService.loginGdbToken(username, password);
    const authHeader = this.getAuthenticationHeader(response);
    const authUser = mapAuthenticatedUserResponseToModel(response.data as AuthenticatedUserResponse);

    if (authHeader) {
      this.authStorageService.setAuthToken(authHeader);
    } else {
      throw new MissingTokenInHeader();
    }
    return authUser;
  };

  private assertIsLoginData(value: unknown): asserts value is LoginData {
    if (typeof value !== 'object' || value === null || !('username' in value) || !('password' in value)) {
      throw new InvalidLoginData();
    }
  }

  private getAuthenticationHeader(response: HttpResponse): string | null {
    return response.headers['authorization'];
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
