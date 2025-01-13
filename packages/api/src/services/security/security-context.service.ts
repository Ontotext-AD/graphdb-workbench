import {ContextService} from '../context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {RestrictedPages} from '../../models/security';

type SecurityContextFields = {
  readonly RESTRICTED_PAGES: string
}

type SecurityContextFieldParams = {
  readonly RESTRICTED_PAGES: RestrictedPages;
}

/**
 * The SecurityContextService class manages the various fields in the security context.
 */
export class SecurityContextService extends ContextService<SecurityContextFields> implements DeriveContextServiceContract<SecurityContextFields, SecurityContextFieldParams> {
  readonly RESTRICTED_PAGES = 'restrictedPages';

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
}
