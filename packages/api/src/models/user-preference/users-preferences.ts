import { UserPreferences } from './user-preferences';

type Preferences = Record<string, UserPreferences>;

/**
 * Represents all stored user preferences.
 *
 * Preferences are stored per user, where the key is the username and the value contains the preferences for that user.
 */
export class UsersPreferences {
  private static readonly CURRENT_VERSION = 1;

  /**
   * Identifies the storage format version. The version can be used to migrate persisted preferences in future releases.
   */
  readonly version: number;

  /**
   * User preferences indexed by username.
   */
  preferences: Preferences = {};

  /**
   * Creates a collection of user preferences.
   *
   * @param value - Optional object used to initialize the collection, typically deserialized from persistent storage.
   */
  constructor(value?: Partial<UsersPreferences> | null) {
    this.version = value?.version ?? UsersPreferences.CURRENT_VERSION;
    this.preferences = value?.preferences ?? {};
  }

  /**
   * Returns the preferences associated with the specified user.
   *
   * @param username - The username whose preferences should be returned.
   * @returns The user's preferences, or {@code undefined} if no preferences are stored.
   */
  getUserPreferences(username: string): UserPreferences | undefined {
    return this.preferences[username];
  }

  /**
   * Stores the preferences for the specified user.
   *
   * @param username - The username whose preferences should be updated.
   * @param userPreferences - The preferences to associate with the user.
   */
  setUserPreferences(username: string, userPreferences: UserPreferences): void {
    this.preferences[username] = userPreferences;
  }

  /**
   * @returns A JSON string representing the preferences of users.
   */
  toString(): string {
    return JSON.stringify(this);
  }
}
