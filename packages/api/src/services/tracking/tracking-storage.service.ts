import {LocalStorageService} from '../storage';
import {LoggerProvider} from '../logging/logger-provider';
import {CookieConsent} from '../../models/tracking';

export class TrackingStorageService extends LocalStorageService {
  readonly NAMESPACE = 'tracking';
  readonly COOKIE_CONSENT = 'cookieConsent';
  readonly LEGACY_COOKIE_CONSENT = 'cookie-consent';

  private readonly logger = LoggerProvider.logger;

  /**
   * Stores a value in the local storage under a key that is prefixed with the service's namespace to avoid collisions.
   * @param key The key under which to store the value (without namespace prefix).
   * @param value The value to store as a string.
   */
  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  /**
   * Saves the user's cookie consent preferences to local storage. The preferences are serialized as a JSON string.
   * @param cookieConsent The cookie consent preferences to save, provided as a partial object. Only the specified
   * properties will be updated in storage.
   */
  setCookieConsent(cookieConsent: Partial<CookieConsent>): void {
    this.set(this.COOKIE_CONSENT, JSON.stringify(cookieConsent));
  }

  /**
   * Retrieves the user's cookie consent preferences from local storage. If legacy data is found under the old key, it
   * will be migrated to the new key and returned. If no data is found, null is returned.
   * @return The user's cookie consent preferences, or null if no preferences are stored.
   */
  getCookieConsent(): CookieConsent | null {
    this.migrateLegacyCookieConsent();
    const data = this.get(this.COOKIE_CONSENT).getAsJson()  as CookieConsent;
    if (data) {
      return new CookieConsent(data);
    }
    return null;
  }

  private migrateLegacyCookieConsent(): void {
    // First check for the legacy cookie consent key to maintain compatibility with existing users.
    // If it exists, migrate the data to the new key and remove the legacy key.
    const legacyData = this.getAsJson(this.LEGACY_COOKIE_CONSENT);
    if (legacyData) {
      this.logger.info('Legacy cookie consent data found. Migrating to new key.', {legacyData});
      this.setCookieConsent(legacyData);
      this.remove(this.LEGACY_COOKIE_CONSENT);
    }
  }
}
