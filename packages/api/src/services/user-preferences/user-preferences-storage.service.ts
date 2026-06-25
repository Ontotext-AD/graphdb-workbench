import { LocalStorageService } from '../storage';
import { UsersPreferences } from '../../models/user-preference/users-preferences';

/**
 * Service for storing and retrieving user preferences data from local storage.
 */
export class UserPreferencesStorageService extends LocalStorageService {
  /**
   * Namespace used for user-related local storage entries.
   */
  readonly NAMESPACE = 'userPreferences';

  /**
   * Local storage key used for persisted preferences of users.
   */
  private readonly USER_PREFERENCES = 'preferences';

  /**
   * Stores a value in local storage.
   *
   * @param key - The storage key.
   * @param value - The value to store.
   */
  set(key: string, value: string): void {
    this.storeValue(key, value);
  }

  /**
   * Stores the preferences of all known users.
   *
   * @param userPreferences - The user preferences collection to persist.
   */
  setUsersPreferences(userPreferences: UsersPreferences): void {
    this.set(this.USER_PREFERENCES, userPreferences.toString());
  }

  /**
   * Returns the persisted preferences of all known users.
   *
   * If no preferences are stored, an empty preferences collection is returned.
   *
   * @returns The stored user preferences collection.
   */
  getPreferences(): UsersPreferences {
    const usersPreferences = this.get(this.USER_PREFERENCES).getValue();

    if (!usersPreferences) {
      return new UsersPreferences();
    }

    try {
      return new UsersPreferences(JSON.parse(usersPreferences));
    } catch {
      return new UsersPreferences();
    }
  }
}
