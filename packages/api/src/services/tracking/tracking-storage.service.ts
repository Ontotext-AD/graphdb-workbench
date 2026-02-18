import {LocalStorageService} from '../storage';
import {LoggerProvider} from '../logging/logger-provider';
import {CookieConsent} from '../../models/cookie';

export class TrackingStorageService extends LocalStorageService {
  readonly NAMESPACE = 'tracking';
  readonly COOKIE_CONSENT = 'cookieConsent';
  readonly LEGACY_COOKIE_CONSENT = 'cookie-consent';
  // {"policyAccepted":true,"statistic":true,"thirdParty":true,"updatedAt":1771421764145}

  private readonly logger = LoggerProvider.logger;

  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  setCookieConsent(cookieConsent: CookieConsent): void {
    this.set(this.COOKIE_CONSENT, JSON.stringify(cookieConsent));
  }

  getCookieConsent(): CookieConsent | null {
    // First check for the legacy cookie consent key to maintain compatibility with existing users.
    // If it exists, migrate the data to the new key and remove the legacy key.
    const legacyData = this.getAsJson(this.LEGACY_COOKIE_CONSENT);
    if (legacyData) {
      this.logger.error('Legacy cookie consent data found. Migrating to new key.', {legacyData});
      this.setCookieConsent(legacyData);
      this.remove(this.LEGACY_COOKIE_CONSENT);
    }
    const data = this.getAsJson(this.COOKIE_CONSENT) as CookieConsent;
    if (data) {
      return new CookieConsent(data);
    }
    return null;
  }
}
