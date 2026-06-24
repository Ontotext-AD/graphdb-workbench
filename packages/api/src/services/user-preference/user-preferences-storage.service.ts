import {LocalStorageService} from '../storage';

/**
 * Service for storing and retrieving user-specific preferences in local storage.
 *
 * Preferences may include UI-related settings such as dismissed banners,
 * view configuration, and other user customizations.
 */
export class UserPreferencesStorageService extends LocalStorageService {
  readonly NAMESPACE = 'userPreferences';
  readonly PREFERENCE_KEY_SOLR_DEPRECATION_BANNER_DISMISSED = 'solrDeprecationBannerDismissed';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  /**
   * Marks the Solr deprecation banner as dismissed.
   */
  dismissSolrDeprecationBanner(): void {
    this.set(this.PREFERENCE_KEY_SOLR_DEPRECATION_BANNER_DISMISSED, 'true');
  }

  /**
   * Checks whether the Solr deprecation banner has been dismissed.
   *
   * @returns `true` if the banner has been dismissed; otherwise `false`.
   */
  isSolrDeprecationBannerDismissed(): boolean {
    return this.get(this.PREFERENCE_KEY_SOLR_DEPRECATION_BANNER_DISMISSED).getValue() === 'true';
  }
}
