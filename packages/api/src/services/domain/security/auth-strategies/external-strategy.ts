import {AuthStrategy, AuthStrategyType} from '../../../../models/security/authentication';
import {SecurityContextService} from '../security-context.service';
import {service} from '../../../../providers';
import {OperationNotSupported} from '../errors/operation-not-supported';
import {AuthenticatedUser} from '../../../../models/security';
import {SecurityService} from '../security.service';

export class ExternalStrategy implements AuthStrategy {
  private readonly securityService = service(SecurityService);
  private readonly securityContextService = service(SecurityContextService);

  type = AuthStrategyType.EXTERNAL;

  /**
   * Initializes the authentication provider. Since the user is externally authenticated, we assume he is already logged in.
   * @returns Promise resolving to true, as the external user is assumed to be authenticated.
   */
  initialize(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Checks if a user is currently authenticated.
   * @returns True if a user is authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    return !!this.securityContextService.getAuthenticatedUser();
  }

  /**
   * Fetches the currently authenticated user using the security service.
   *
   * @returns A promise that resolves to the authenticated user.
   */
  fetchAuthenticatedUser(): Promise<AuthenticatedUser> {
    return this.securityService.getAuthenticatedUser();
  }

  login(): Promise<AuthenticatedUser> {
    throw new OperationNotSupported();
  }

  /**
   * Logs out the current user. Since the user is externally authenticated, this method throws an error.
   */
  logout(): Promise<void> {
    throw new OperationNotSupported();
  }

  /**
   * Indicates that this strategy is for external users.
   * @returns true, as this strategy is for external authentication.
   */
  isExternal(): boolean {
    return true;
  }
}
