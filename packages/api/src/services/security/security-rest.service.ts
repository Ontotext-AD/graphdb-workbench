import {HttpService} from '../http/http.service';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';
import {AuthSettingsResponseModel} from '../../models/security';
import {AuthSettingsRequestModel} from '../../models/security/response-models/auth-settings-request-model';

/**
 * Service class for handling security-related REST operations.
 */
export class SecurityRestService extends HttpService {
  private readonly SECURITY_ENDPOINT = 'rest/security';
  private readonly LOGIN_ENDPOINT = 'rest/login';
  private readonly SECURITY_USER_ENDPOINT = `${this.SECURITY_ENDPOINT}/users`;
  private readonly SECURITY_FREE_ACCESS_ENDPOINT = `${this.SECURITY_ENDPOINT}/free-access`;

  /**
   * Authenticates a user by sending credentials to the server.
   *
   * Sends a POST request to the login endpoint with the provided username and password.
   *
   * @param username - The user's login name.
   * @param password - The user's password.
   * @returns A Promise resolving to an HttpResponse containing the AuthenticatedUser data on success.
   */
  loginGdbToken(username: string, password: string): Promise<Response> {
    return this.postFull(this.LOGIN_ENDPOINT, {username, password});
  }

  /**
   * Updates the application settings for a specific user.
   *
   * @param user - The authenticated user whose data needs to be updated.
   * @returns A Promise that resolves when the update is successful, or rejects if there's an error.
   */
  updateUserData(user: AuthenticatedUser): Promise<void> {
    return this.patch<void>(`${this.SECURITY_ENDPOINT}/users/${this.encodeURIComponentStrict(user.username)}`,
      {
        appSettings: user.appSettings,
      }
    );
  }

  /**
   * Retrieves the full security configuration from the backend.
   *
   * Sends a GET request to fetch the application's security-related configuration, including roles, permissions,
   * and OpenID settings.
   *
   * @returns A Promise that resolves with the SecurityConfig object.
   */
  getSecurityConfig(): Promise<SecurityConfig> {
    return this.get(`${this.SECURITY_ENDPOINT}/all`);
  }

  /**
   * Retrieves information about the currently authenticated user.
   *
   * Sends a GET request to the security endpoint to fetch details about the user
   * who is currently authenticated in the system.
   *
   * @returns A Promise that resolves with the AuthenticatedUser object containing
   *          the user's details such as username, roles, and application settings.
   */
  getAuthenticatedUser(): Promise<AuthenticatedUser> {
    return this.get(`${this.SECURITY_ENDPOINT}/authenticated-user`);
  }

  /**
   * Retrieves information about the admin user.
   *
   * Sends a GET request to fetch details about the admin user in the system.
   *
   * @returns A Promise that resolves with the AuthenticatedUser object containing
   *          the admin user's details such as username, roles, and application settings.
   */
  getAdminUser(): Promise<AuthenticatedUser> {
    return this.get(`${this.SECURITY_USER_ENDPOINT}/admin`);
  }

  /**
   * Retrieves the free access settings from the backend.
   *
   * Sends a GET request to fetch the configuration related to free access mode.
   *
   * @returns A Promise that resolves with the AuthSettingsResponseModel containing
   *          the free access settings.
   */
  getFreeAccess(): Promise<AuthSettingsResponseModel> {
    return this.get(this.SECURITY_FREE_ACCESS_ENDPOINT);
  }

  /**
   * Sets the free access configuration in the backend.
   *
   * Sends a POST request to update the free access settings with the provided data.
   *
   * @param freeAccessData - An AuthSettingsRequestModel object containing the new free access settings.
   * @returns A Promise that resolves with the AuthSettingsResponseModel after updating the settings.
   */
  setFreeAccess(freeAccessData: AuthSettingsRequestModel): Promise<AuthSettingsResponseModel> {
    return this.post(this.SECURITY_FREE_ACCESS_ENDPOINT, freeAccessData);
  }
}
