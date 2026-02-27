import {Service} from '../../providers/service/service';
import {SecurityRestService} from './security-rest.service';
import {service} from '../../providers';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';
import {SecurityContextService} from './security-context.service';
import {AuthSettings} from '../../models/security/auth-settings';
import {AuthSettingsRequestModel} from '../../models/security/response-models/auth-settings-request-model';
import {UsersService} from '../users';
import {User} from '../../models/users/user';
import {HttpResponse} from '../../models/http';
import {AuthenticatedUserResponse} from '../../models/security/response-models/authenticated-user-response';
import {mapAuthenticatedUserResponseToModel} from './mappers/authenticated-user.mapper';
import {mapAuthSettingsResponseToModel} from './mappers/auth-settings.mapper';
import {mapSecurityConfigResponseToModel} from './mappers/security-config.mapper';
import {mapGraphdbAuthoritiesResponseToModel} from './mappers/graphdb-authorities-model-mapper';

/**
 * Service class for handling security-related operations.
 */
export class SecurityService implements Service {
  private readonly securityRestService = service(SecurityRestService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly usersService = service(UsersService);

  /**
   * Updates the data of the authenticated user.
   *
   * Updates the authenticated user's data in the backend using the provided {@link User}
   *
   * @param user - The User object containing the updated data.
   * @returns A Promise that resolves when the user data has been successfully updated.
   */
  updateAuthenticatedUser(user: User): Promise<void> {
    return this.usersService.updateCurrentUser(user);
  }

  /**
   * Retrieves the current security configuration from the backend.
   *
   * Fetches the security configuration and maps it to a `SecurityConfig` model using the appropriate mapper.
   *
   * @returns A Promise that resolves with the mapped `SecurityConfig` instance.
   */
  getSecurityConfig(): Promise<SecurityConfig> {
    return this.securityRestService.getSecurityConfig().then((response) => mapSecurityConfigResponseToModel(response));
  }

  /**
   * Retrieves the free access settings from the backend.
   *
   * Fetches the free access settings and maps it to an `AuthSettings` model using the appropriate mapper.
   *
   * @returns A Promise that resolves with the mapped `AuthSettings` instance.
   */
  getFreeAccess(): Promise<AuthSettings> {
    return this.securityRestService.getFreeAccess()
      .then(function (response) {
        return mapAuthSettingsResponseToModel(response);
      });
  }

  /**
   * Sets the free access configuration in the backend.
   *
   * Sends the updated free access settings to the backend and updates the security configuration
   * in the context with the latest data.
   *
   * @param enabled - A boolean indicating whether free access is enabled.
   * @param freeAccess - An optional `AuthSettings` object containing additional free access settings.
   * @returns A Promise that resolves when the free access settings have been successfully updated.
   */
  setFreeAccess(enabled: boolean, freeAccess?: AuthSettings): Promise<void> {
    const freeAccessData: AuthSettingsRequestModel = {
      enabled: enabled
    };
    if (enabled) {
      if (!freeAccess) {
        throw new Error('Free access settings must be provided when enabling free access');
      }
      freeAccessData.authorities = mapGraphdbAuthoritiesResponseToModel(freeAccess?.authorities);
      freeAccessData.appSettings = {
        ...freeAccess?.appSettings
      } as Record<string, unknown>;
    }

    return this.securityRestService.setFreeAccess(freeAccessData)
      .then(() => this.getSecurityConfig())
      .then((securityConfig) => {
        this.securityContextService.updateSecurityConfig(securityConfig);
      });
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
      .then((response) => mapAuthenticatedUserResponseToModel(response));
  }

  /**
   * Retrieves the admin user from the backend.
   *
   * Fetches the admin user's information and maps it to an `AuthenticatedUser` model
   * using the appropriate mapper.
   *
   * @returns A Promise that resolves with the mapped `AuthenticatedUser` instance representing the admin user.
   */
  getAuthenticatedAdminUser(): Promise<AuthenticatedUser> {
    return this.usersService.getAdminUser()
      .then((adminUser) => AuthenticatedUser.fromUser(adminUser));
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
  loginGdbToken(username: string, password: string): Promise<HttpResponse<AuthenticatedUserResponse>> {
    return this.securityRestService.loginGdbToken(username, password);
  }
}
