import {SessionStorageService} from '../../../storage';
import {StorageData} from '../../../../models/storage';

/**
 * Service for the OpenID Connect data that belongs to a single tab, kept in the session storage.
 *
 * The data survives the redirect to the OpenID provider and back in the same tab, and other tabs do not see it.
 */
export class OpenidSessionStorageService extends SessionStorageService {
  private readonly returnUrl = 'return_url';
  private readonly pkceState = 'pkce_state';
  private readonly pkceCodeVerifier = 'pkce_code_verifier';

  /**
   * Same namespace as {@link OpenidLocalStorageService}, so that all OpenID keys share the `ontotext.gdb.auth.openid.`
   * prefix.
   */
  readonly NAMESPACE = 'auth.openid';

  /**
   * Stores the value for the given key in the session storage.
   * @param key The key to set the value for.
   * @param value The value to set.
   */
  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  /**
   * Stores the page to return to after the OpenID provider redirects back to the Workbench.
   * @param url The page, without the context path.
   */
  setReturnUrl(url: string): void {
    this.set(this.returnUrl, url);
  }

  /**
   * Returns the page to return to after the OpenID provider redirects back to the Workbench.
   * @returns The page wrapped in a StorageData object, with a null value when none is stored.
   */
  getReturnUrl(): StorageData {
    return this.get(this.returnUrl);
  }

  /**
   * Removes the stored return page, so that it is used only once.
   */
  clearReturnUrl(): void {
    this.remove(this.returnUrl);
  }

  /**
   * Stores the PKCE state sent to the OpenID provider, to check it when the provider redirects back.
   * @param state The state.
   */
  setPkceState(state: string): void {
    this.set(this.pkceState, state);
  }

  /**
   * Returns the PKCE state sent to the OpenID provider.
   * @returns The state wrapped in a StorageData object, with a null value when none is stored.
   */
  getPkceState(): StorageData {
    return this.get(this.pkceState);
  }

  /**
   * Stores the PKCE code verifier, to send it with the authorization code when the provider redirects back.
   * @param codeVerifier The code verifier.
   */
  setPkceCodeVerifier(codeVerifier: string): void {
    this.set(this.pkceCodeVerifier, codeVerifier);
  }

  /**
   * Returns the PKCE code verifier.
   * @returns The code verifier wrapped in a StorageData object, with a null value when none is stored.
   */
  getPkceCodeVerifier(): StorageData {
    return this.get(this.pkceCodeVerifier);
  }

  /**
   * Removes the PKCE state and code verifier, once the login no longer needs them.
   */
  clearPkce(): void {
    this.clearPkceState();
    this.clearPkceCodeVerifier();
  }

  private clearPkceState(): void {
    this.remove(this.pkceState);
  }

  /**
   * Removes the stored PKCE code verifier.
   */
  clearPkceCodeVerifier(): void {
    this.remove(this.pkceCodeVerifier);
  }
}
