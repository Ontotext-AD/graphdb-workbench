import { service } from '../../providers';
import { UserPreferencesStorageService } from './user-preferences-storage.service';
import { AuthenticationService, SecurityContextService } from '../domain/security';
import { UserPreferencesContextService } from './user-preferences-context.service';
import { UserPreferences } from '../../models/user-preference/user-preferences';

/**
 * Service for loading, updating, and persisting user preferences.
 *
 * Preferences are stored per current user:
 * - A currently logged-in user has an individual set of preferences.
 * - The anonymous user, used when security is disabled or free access is enabled,
 *   has a shared persisted set of preferences identified by the {@link ANONYMOUS_USER} key.
 */
export class UserPreferencesService {

  private static readonly ANONYMOUS_USER = 'anonymous';

  private readonly userPreferencesStorageService = service(UserPreferencesStorageService);
  private readonly userPreferencesContextService = service(UserPreferencesContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authenticationService = service(AuthenticationService);

  /**
   * Marks the Solr deprecation banner as dismissed for the current user.
   *
   * The preference is updated in the application context and persisted for the current user.
   * A currently logged-in user has individual preferences, while the anonymous user shares
   * a common persisted set of preferences.
   */
  dismissSolrDeprecationBanner(): void {
    const userPreferences = this.getCurrentUserPreferences();
    userPreferences.isSolrDeprecationBannerDismissed = true;

    this.userPreferencesContextService.updateUserPreferences(userPreferences);
    this.persistCurrentUserPreferences(userPreferences);
  }

  /**
   * Checks whether the Solr deprecation banner has been dismissed by the current user.
   *
   * @returns {@code true} if the banner was dismissed, otherwise {@code false}.
   */
  isSolrDeprecationBannerDismissed(): boolean {
    return this.userPreferencesContextService.getUserPreferences()?.isSolrDeprecationBannerDismissed ?? false;
  }

  /**
   * Loads the preferences for the current user into the application context.
   *
   * A currently logged-in user receives their individual persisted preferences.
   * The anonymous user receives the shared anonymous preferences.
   */
  loadUserPreferences(): void {
    const currentUsername = this.getCurrentUsername();

    // The username is expected to be available for a currently logged-in user,
    // but the service API allows it to be undefined.
    if (!currentUsername) {
      return;
    }

    const currentUserPreferences = this.loadCurrentUserPreferences(currentUsername) ?? new UserPreferences();
    this.userPreferencesContextService.updateUserPreferences(currentUserPreferences);
  }

  /**
   * Returns the username of the current user.
   *
   * A currently logged-in user is identified by their username.
   * The anonymous user is identified by the {@link ANONYMOUS_USER} key.
   *
   * @returns The username of the current user, or {@code undefined} if the username
   * of the currently logged-in user cannot be determined.
   */
  private getCurrentUsername(): string | undefined {
    if (this.authenticationService.isLoggedIn()) {
      return this.securityContextService.getAuthenticatedUser()?.toUser().username;
    }

    return UserPreferencesService.ANONYMOUS_USER;
  }

  /**
   * Loads the persisted preferences for the specified user.
   *
   * @param username - The username of the user whose preferences should be loaded.
   * @returns The persisted preferences, or {@code undefined} if no preferences exist.
   */
  private loadCurrentUserPreferences(username: string): UserPreferences | undefined {
    return this.userPreferencesStorageService
      .getPreferences()
      .getUserPreferences(username);
  }

  /**
   * Returns the current user's preferences from the application context.
   *
   * If no preferences exist in the context, a new preferences instance is created.
   *
   * @returns The current user's preferences.
   */
  private getCurrentUserPreferences(): UserPreferences {
    return this.userPreferencesContextService.getUserPreferences() ?? new UserPreferences();
  }

  /**
   * Persists the preferences for the current user.
   *
   * A currently logged-in user's preferences are stored under their username.
   * The anonymous user's preferences are stored under the {@link ANONYMOUS_USER} key.
   *
   * @param userPreferences - The current user's preferences to persist.
   */
  private persistCurrentUserPreferences(userPreferences: UserPreferences): void {
    const username = this.getCurrentUsername();

    // The username is expected to be available for a currently logged-in user, but the service API allows it to be undefined.
    if (!username) {
      return;
    }

    const usersPreferences = this.userPreferencesStorageService.getPreferences();
    usersPreferences.setUserPreferences(username, userPreferences);
    this.userPreferencesStorageService.setUsersPreferences(usersPreferences);
  }
}
