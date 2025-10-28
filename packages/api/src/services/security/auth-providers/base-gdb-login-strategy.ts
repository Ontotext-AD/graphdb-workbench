import {AuthStrategy, AuthStrategyType} from '../../../models/security/authentication';
import {AuthenticatedUser} from '../../../models/security';
import {MissingTokenInHeader} from '../errors/missing-token-in-header';
import {LoginData} from '../../../models/security/authentication/login-data';
import {MapperProvider, service} from '../../../providers';
import {AuthenticatedUserMapper} from '../mappers/authenticated-user.mapper';
import {SecurityService} from '../security.service';
import {LoggerProvider} from '../../logging/logger-provider';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {ResponseMappingError} from '../errors/response-mapping-error';

/**
 * Abstract base class for GDB login strategies.
 * Implements common login functionality for GDB token-based authentication.
 * Strategies, which need to be able to use the login method, should extend this class, e.g. GdbTokenAuthProvider, ExternalStrategy.
 */
export abstract class BaseGdbLoginStrategy implements AuthStrategy {
  protected readonly securityService = service(SecurityService);
  protected readonly logger = LoggerProvider.logger;
  protected readonly authStorageService = service(AuthenticationStorageService);

  abstract type: AuthStrategyType;

  abstract initialize(): Promise<boolean>;

  abstract isAuthenticated(): boolean;

  abstract logout(): Promise<void>;

  abstract isExternal(): boolean;

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
    const {username, password} = loginData;
    const response = await this.securityService.loginGdbToken(username, password);

    const authHeader = this.getAuthenticationHeader(response);
    let authUser;

    try {
      authUser = await this.getUserFromResponse(response);
    } catch (e) {
      this.logger.error('Could not map user from response', e);
      throw new ResponseMappingError('Failed to map user from response');
    }

    if (authHeader) {
      this.authStorageService.setAuthToken(authHeader);
    } else {
      throw new MissingTokenInHeader();
    }
    return authUser;
  };

  private getAuthenticationHeader(response: Response): string | null {
    return response.headers.get('authorization');
  }

  private async getUserFromResponse(response: Response): Promise<AuthenticatedUser> {
    const responseData = await response.json();
    return MapperProvider.get(AuthenticatedUserMapper).mapToModel(responseData);
  }
}
