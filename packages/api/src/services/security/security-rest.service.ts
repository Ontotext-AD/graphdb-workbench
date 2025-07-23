import {HttpService} from '../http/http.service';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';

/**
 * Service class for handling security-related REST operations.
 */
export class SecurityRestService extends HttpService {
  private readonly SECURITY_ENDPOINT = 'rest/security';
  private readonly LOGIN_ENDPOINT = 'rest/login';

  /**
   * Authenticates a user by sending credentials to the server.
   *
   * Sends a POST request to the login endpoint with the provided username and password.
   *
   * @param username - The user's login name.
   * @param password - The user's password.
   * @returns A Promise resolving to an HttpResponse containing the AuthenticatedUser data on success.
   */
  login(username: string, password: string): Promise<Response> {
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
}
