import { service } from '../../providers';
import { UserPreferencesStorageService } from './user-preferences-storage.service';
import {AuthenticationService, SecurityContextService} from '../domain/security';
import { UserPreferencesContextService } from './user-preferences-context.service';
import { UserPreferences } from '../../models/user-preference/user-preferences';

/**
 * Service for loading, updating, and persisting user preferences.
 *
 * Preferences are persisted only when the current user is authenticated.
 * Anonymous users keep their preferences only in the current application context,
 * so their choices are reset after a page refresh.
 */
export class UserPreferencesService {
  private readonly userPreferencesStorageService = service(UserPreferencesStorageService);
  private readonly userPreferencesContextService = service(UserPreferencesContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authenticationService = service(AuthenticationService);

  /**
   * Marks the Solr deprecation banner as dismissed.
   *
   * For authenticated users, the preference is persisted and restored after refresh.
   * For anonymous users, including non-secured access and free-access mode, the preference is stored
   * only in the current application context.
   */
  dismissSolrDeprecationBanner(): void {
    const userPreferences = this.getCurrentUserPreferences();
    userPreferences.isSolrDeprecationBannerDismissed = true;
    this.userPreferencesContextService.updateUserPreferences(userPreferences);

    if (this.authenticationService.isLoggedIn()) {
      this.persistCurrentUserPreferences(userPreferences);
    }
  }

  /**
   * Checks whether the Solr deprecation banner has been dismissed.
   *
   * @returns {@code true} if the banner was dismissed, otherwise {@code false}.
   */
  isSolrDeprecationBannerDismissed(): boolean {
    return this.userPreferencesContextService.getUserPreferences()?.isSolrDeprecationBannerDismissed ?? false;
  }

  /**
   * Loads the preferences for the current user into the application context.
   *
   * Authenticated users receive their persisted preferences.
   * Anonymous users receive a new in-memory preferences instance.
   */
  loadUserPreferences(): void {
    if (this.authenticationService.isLoggedIn()) {
      this.userPreferencesContextService.updateUserPreferences(this.loadCurrentUserPreferences() ?? new UserPreferences());
    } else {
      this.userPreferencesContextService.updateUserPreferences(new UserPreferences());
    }
  }

  /**
   * Loads preferences for the current user.
   *
   * @returns Persisted preferences for authenticated users, or a new preferences instance for anonymous users.
   */
  private loadCurrentUserPreferences(): UserPreferences | undefined {
    const username = this.getAuthenticatedUsername();

    // The username is expected to be available for authenticated users, but the service API allows it to be undefined.
    if (!username) {
      return new UserPreferences();
    }

    return this.userPreferencesStorageService
      .getPreferences()
      .getUserPreferences(username);
  }

  /**
   * Returns the current user preferences from the context.
   *
   * If no preferences exist in the context, a new preferences instance is created.
   *
   * @returns The current user preferences.
   */
  private getCurrentUserPreferences(): UserPreferences {
    return this.userPreferencesContextService.getUserPreferences() ?? new UserPreferences();
  }

  /**
   * Persists the preferences for the current authenticated user.
   *
   * @param userPreferences - Preferences to persist for the authenticated user.
   */
  private persistCurrentUserPreferences(userPreferences: UserPreferences): void {
    const username = this.getAuthenticatedUsername();

    if (!username) {
      return;
    }

    const usersPreferences = this.userPreferencesStorageService.getPreferences();
    usersPreferences.setUserPreferences(username, userPreferences);
    this.userPreferencesStorageService.setUsersPreferences(usersPreferences);
  }

  /**
   * Returns the username of the authenticated user.
   *
   * @returns The authenticated username, or {@code undefined} if no user is authenticated.
   */
  private getAuthenticatedUsername(): string | undefined {
    return this.securityContextService.getAuthenticatedUser()?.toUser().username;
  }
}
