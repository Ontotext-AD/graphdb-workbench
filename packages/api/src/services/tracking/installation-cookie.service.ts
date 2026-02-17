// The name of the cookie that stores installation-related data.
import {Service} from '../../providers/service/service';
import {service} from '../../providers';
import {CookieService} from '../cookie';
import {DateUtil} from '../utils/date-util';

const INSTALLATION_COOKIE_NAME = '_wb';

// The version of the installation cookie format. This is used to ensure
// compatibility with future versions of the cookie structure.
const INSTALLATION_COOKIE_VERSION = 'WB1';

// The number of days the installation cookie will remain valid before it expires.
// In this case, the cookie is set to expire in 400 days from the date it is created.
const INSTALLATION_COOKIE_EXPIRATION_IN_DAYS = 400;

/**
 * The SameSite attribute controls when the browser includes this cookie in request headers:
 *
 * - First-party requests (same-site):
 *   - Always include the cookie for any method (GET, POST, PUT, etc.).
 *
 * - Cross-site requests (third-party):
 *   - 'Strict':  never include the cookie in any cross-site context.
 *   - 'Lax':     include the cookie only on top-level GET navigations (e.g., clicking a link, entering URL),
 *                but block it on background or embedded requests (iframes, AJAX, form POSTs).
 *   - 'None':    include the cookie in all cross-site requests but requires Secure (HTTPS) flag.
 *
 * We choose 'Lax' to ensure cookies are sent on normal navigations while preventing
 * them on most cross-site POSTs and embedded resource requests, reducing CSRF exposure.
 */
const SAME_SITE_POLICY = 'Lax';

/**
 * Service to manage installation-specific cookies for the application.
 * It checks if a specific installation cookie exists, sets it if necessary,
 * retrieves it, or deletes it when required.
 *
 * @param {Object} CookieService - AngularJS service to manage cookies.
 * @return {Object} - Returns an object with methods to get, set, setIfAbsent, and remove installation cookies.
 */
export class InstallationCookieService implements Service  {
  private readonly cookieService = service(CookieService);
  private readonly timeProvider = DateUtil;

  /**
   * Checks if the installation cookie exists and retrieves its value.
   *
   * @return The installation cookie value if it exists, otherwise undefined.
   */
  get() {
    return this.cookieService.get(INSTALLATION_COOKIE_NAME);
  }

  /**
   * Creates and sets an installation cookie with a specific installation ID and the current timestamp.
   * The cookie value is constructed as `version.installationId.timestamp`, and it is set to expire
   * in 400 days (based on the `INSTALLATION_COOKIE_EXPIRATION_IN_DAYS` constant).
   *
   * @param installationId - The unique installation ID to be stored in the cookie.
   */
  set(installationId: string)  {
    const timestamp = this.timeProvider.now();
    const cookieValue = `${INSTALLATION_COOKIE_VERSION}.${installationId}.${timestamp}`;
    this.cookieService.set(INSTALLATION_COOKIE_NAME, cookieValue, {expiration: INSTALLATION_COOKIE_EXPIRATION_IN_DAYS, sameSite: SAME_SITE_POLICY});
  }

  /**
   * Sets the installation cookie if it does not already exist.
   *
   * @param installationId - The unique installation ID to be stored in the cookie.
   */
  setIfAbsent(installationId: string) {
    if (!this.get()) {
      this.set(installationId);
    }
  }

  /**
   * Deletes the installation cookie by removing it from the browser.
   */
  remove() {
    this.cookieService.remove(INSTALLATION_COOKIE_NAME);
  }
}
