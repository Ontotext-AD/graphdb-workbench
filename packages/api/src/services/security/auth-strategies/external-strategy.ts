import {AuthStrategyType} from '../../../models/security/authentication';
import {SecurityContextService} from '../security-context.service';
import {service} from '../../../providers';
import {BaseGdbLoginStrategy} from './base-gdb-login-strategy';
import {OperationNotSupported} from '../errors/operation-not-supported';

export class ExternalStrategy extends BaseGdbLoginStrategy {
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
