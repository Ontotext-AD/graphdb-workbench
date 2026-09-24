import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ViewRestriction} from '../../models/restrictions';

type RestrictionContextFields = {
  readonly IS_VIEW_RESTRICTED: string;
  readonly VIEW_RESTRICTION: string;
}

type RestrictionContextFieldParams = {
  readonly IS_VIEW_RESTRICTED: boolean;
  readonly VIEW_RESTRICTION: ViewRestriction;
};

/**
 * Service for managing restriction context in the application.
 */
export class RestrictionContextService extends ContextService<RestrictionContextFields> implements DeriveContextServiceContract<RestrictionContextFields, RestrictionContextFieldParams> {
  readonly IS_VIEW_RESTRICTED = 'isViewRestricted';
  readonly VIEW_RESTRICTION = 'viewRestriction';

  /**
   * Updates the current isViewRestricted state and notifies subscribers.
   *
   * @param isViewRestricted The new isViewRestricted value.
   */
  updateIsViewRestricted(isViewRestricted: boolean): void {
    this.updateContextProperty(this.IS_VIEW_RESTRICTED, isViewRestricted);
  }

  /**
   * Retrieves the isViewRestricted value from the current context.
   *
   * @returns The current isViewRestricted value, or `false` if not set.
   */
  isViewRestricted(): boolean {
    return this.getContextPropertyValue(this.IS_VIEW_RESTRICTED) ?? false;
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the isViewRestricted state changes.
   *
   * @param callbackFunction - The function to call when the isViewRestricted state changes.
   * @returns A function to unsubscribe from updates.
   */
  onIsViewRestrictedChanged(callbackFunction: (isViewRestricted: boolean) => void): () => void {
    return this.subscribe<boolean>(this.IS_VIEW_RESTRICTED, (isViewRestricted) => callbackFunction(isViewRestricted ?? false));
  }

  /**
   * Updates the current view restriction and notifies subscribers.
   *
   * @param viewRestriction The new view restriction value.
   */
  updateViewRestriction(viewRestriction: ViewRestriction): void {
    this.updateContextProperty(this.VIEW_RESTRICTION, viewRestriction);
  }

  /**
   * Retrieves the view restriction from the current context.
   *
   * @returns The current view restriction, or `undefined` if not set.
   */
  viewRestriction(): ViewRestriction | undefined {
    return this.getContextPropertyValue(this.VIEW_RESTRICTION);
  }
}
