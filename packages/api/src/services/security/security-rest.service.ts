import {HttpService} from '../http/http.service';
import {AuthenticatedUser} from '../../models/security';

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
}
