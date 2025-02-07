import {Service} from '../../providers/service/service';
import {SecurityRestService} from './security-rest.service';
import {ServiceProvider} from '../../providers';
import {AuthenticatedUser} from '../../models/security';
import {SecurityContextService} from './security-context.service';

/**
 * Service class for handling security-related operations.
 */
export class SecurityService implements Service {
  private readonly securityRestService: SecurityRestService = ServiceProvider.get(SecurityRestService);
  private readonly securityContextService: SecurityContextService = ServiceProvider.get(SecurityContextService);

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
}
