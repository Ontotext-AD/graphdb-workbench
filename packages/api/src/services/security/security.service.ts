import {Service} from '../../providers/service/service';
import {SecurityRestService} from './security-rest.service';
import {MapperProvider, ServiceProvider} from '../../providers';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';
import {SecurityContextService} from './security-context.service';
import {SecurityConfigMapper} from './mappers/security-config.mapper';
import {AuthenticatedUserMapper} from './mappers/authenticated-user.mapper';
import {AuthenticationStorageService} from './authentication-storage.service';

/**
 * Service class for handling security-related operations.
 */
export class SecurityService implements Service {
  private readonly securityRestService: SecurityRestService = ServiceProvider.get(SecurityRestService);
  private readonly securityContextService: SecurityContextService = ServiceProvider.get(SecurityContextService);
  private readonly authStorageService: AuthenticationStorageService = ServiceProvider.get(AuthenticationStorageService);

  /**
   * Updates the data of an authenticated user.
   *
   * Updates the authenticated user's data in the backend using the provided user object and updates the
   * context with the updated user data.
   *
   * @param user - The authenticated user object containing the updated data.
   * @returns A Promise that resolves when the user data has been successfully updated.
   */
  updateUserData(user: AuthenticatedUser): Promise<void> {
    return this.securityRestService.updateUserData(user)
      .then(() => this.securityContextService.updateAuthenticatedUser(user));
  }

  /**
   * Retrieves the current security configuration from the backend.
   *
   * Fetches the security configuration and maps it to a `SecurityConfig` model using the appropriate mapper.
   *
   * @returns A Promise that resolves with the mapped `SecurityConfig` instance.
   */
  getSecurityConfig(): Promise<SecurityConfig> {
    return this.securityRestService.getSecurityConfig().then((response) => MapperProvider.get(SecurityConfigMapper).mapToModel(response));
  }

  /**
   * Retrieves the currently authenticated user from the backend.
   *
   * Fetches the authenticated user's information and maps it to an `AuthenticatedUser` model
   * using the appropriate mapper.
   *
   * @returns A Promise that resolves with the mapped `AuthenticatedUser` instance
   */
  getAuthenticatedUser(): Promise<AuthenticatedUser> {
    return this.securityRestService.getAuthenticatedUser()
      .then((response) => MapperProvider.get(AuthenticatedUserMapper).mapToModel(response));
  }

  /**
   * Checks if password-based login is enabled in the current security configuration.
   *
   * @returns `true` if password login is enabled; `undefined` if no config is present.
   */
  isPasswordLoginEnabled(): boolean {
    return this.securityContextService.getSecurityConfig()?.passwordLoginEnabled ?? false;
  }

  /**
   * Checks if OpenID login is enabled in the current security configuration.
   *
   * @returns `true` if OpenID is enabled; `undefined` if no config is present.
   */
  isOpenIDEnabled(): boolean {
    return this.securityContextService.getSecurityConfig()?.openIdEnabled ?? false;
  }

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
  loginGdbToken(username: string, password: string): Promise<Response> {
    return this.securityRestService.loginGdbToken(username, password);
  }
}
