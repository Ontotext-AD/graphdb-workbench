import {ContextService} from '../context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {AuthenticatedUser, RestrictedPages, SecurityConfig} from '../../models/security';

type SecurityContextFields = {
  readonly RESTRICTED_PAGES: string
  readonly SECURITY_CONFIG: string;
  readonly AUTHENTICATED_USER: string;
}

type SecurityContextFieldParams = {
  readonly RESTRICTED_PAGES: RestrictedPages;
  readonly SECURITY_CONFIG: SecurityConfig;
  readonly AUTHENTICATED_USER: AuthenticatedUser;
}

/**
 * The SecurityContextService class manages the various fields in the security context.
 */
export class SecurityContextService extends ContextService<SecurityContextFields> implements DeriveContextServiceContract<SecurityContextFields, SecurityContextFieldParams> {
  readonly RESTRICTED_PAGES = 'restrictedPages';
  readonly SECURITY_CONFIG = 'securityConfig';
  readonly AUTHENTICATED_USER = 'authenticatedUser';

  /**
   * Retrieves the restricted pages for the user.
   *
   * @return a map with restricted pages.
   */
  getRestrictedPages(): RestrictedPages | undefined {
    return this.getContextPropertyValue(this.RESTRICTED_PAGES) || new RestrictedPages();
  }

  /**
   * Updates the restricted pages and notifies subscribers about the change.
   *
   * @param restrictedPages - an object with restricted pages.
   */
  updateRestrictedPages(restrictedPages: RestrictedPages): void {
    this.updateContextProperty(this.RESTRICTED_PAGES, restrictedPages);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the restricted pages are changed.
   *
   * @param callbackFunction - The function to call when the restricted pages are changed.
   * @returns A function to unsubscribe from updates.
   */
  onRestrictedPagesChanged(callbackFunction: ValueChangeCallback<RestrictedPages | undefined>): () => void {
    return this.subscribe(this.RESTRICTED_PAGES, callbackFunction);
  }

  /**
   * Updates the security configuration in the context.
   * @param securityConfig - The new security configuration to be set.
   */
  updateSecurityConfig(securityConfig: SecurityConfig): void {
    this.updateContextProperty(this.SECURITY_CONFIG, securityConfig);
  }

  /**
   * Subscribes to changes in the security configuration.
   * @param callbackFunction - A function to be called when the security configuration changes.
   * @returns A function that, when called, unsubscribes from the security configuration changes.
   */
  onSecurityConfigChanged(callbackFunction: ValueChangeCallback<SecurityConfig | undefined>): () => void {
    return this.subscribe(this.SECURITY_CONFIG, callbackFunction);
  }

  /**
   * Updates the authenticated user information in the context.
   * @param authenticatedUser - The new authenticated user information to be set.
   */
  updateAuthenticatedUser(authenticatedUser: AuthenticatedUser): void {
    this.updateContextProperty(this.AUTHENTICATED_USER, authenticatedUser);
  }

  /**
   * Subscribes to changes in the authenticated user information.
   * @param callbackFunction - A function to be called when the authenticated user information changes.
   * @returns A function that, when called, unsubscribes from the authenticated user information changes.
   */
  onAuthenticatedUserChanged(callbackFunction: ValueChangeCallback<AuthenticatedUser | undefined>): () => void {
    return this.subscribe(this.AUTHENTICATED_USER, callbackFunction);
  }

  /**
   * Retrieves the authenticated user information.
   * @return the authenticated user information or undefined, if there is no user.
   */
  getAuthenticatedUser(): AuthenticatedUser | undefined {
    return this.getContextPropertyValue(this.AUTHENTICATED_USER);
  }
}
