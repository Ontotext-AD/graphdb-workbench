import {HttpService} from '../http/http.service';
import {AuthenticatedUser, SecurityConfig} from '../../models/security';

/**
 * Service class for handling security-related REST operations.
 */
export class SecurityRestService extends HttpService {
  private readonly SECURITY_ENDPOINT = '/rest/security';

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
}
