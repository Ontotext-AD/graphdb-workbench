import { ContextService } from '../context';
import { DeriveContextServiceContract } from '../../models/context/update-context-method';
import { LifecycleHooks } from '../../providers/service/lifecycle-hooks';
import { ValueChangeCallback } from '../../models/context/value-change-callback';
import { UserPreferences } from '../../models/user-preference/user-preferences';

type UserPreferencesContextFields = {
  readonly USER_PREFERENCES: string;
};

type UserPreferencesContextFieldParams = {
  readonly USER_PREFERENCES: UserPreferences;
};

/**
 * Context service responsible for storing user-specific data for the current application session.
 */
export class UserPreferencesContextService extends ContextService<UserPreferencesContextFields> implements DeriveContextServiceContract<UserPreferencesContextFields, UserPreferencesContextFieldParams>, LifecycleHooks {
  readonly USER_PREFERENCES = 'userPreferences';

  /**
   * Returns the current user's preferences.
   *
   * @returns The current user's preferences, or {@code undefined} if they have not been initialized.
   */
  getUserPreferences(): UserPreferences | undefined {
    return this.getContextPropertyValue(this.USER_PREFERENCES);
  }

  /**
   * Updates the current user's preferences.
   *
   * @param userPreferences - The preferences to store for the current user.
   */
  updateUserPreferences(userPreferences: UserPreferences): void {
    this.updateContextProperty(this.USER_PREFERENCES, userPreferences);
  }

  /**
   * Registers a callback invoked whenever the current user's preferences are updated.
   *
   * @param callbackFunction - The function to invoke when the preferences change.
   * @returns A function that unsubscribes the callback.
   */
  onUserPreferencesChanged(callbackFunction: ValueChangeCallback<UserPreferences | undefined>): () => void {
    return this.subscribe(this.USER_PREFERENCES, callbackFunction);
  }
}
