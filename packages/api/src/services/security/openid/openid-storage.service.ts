import {LocalStorageService} from '../../storage';
import {StorageData} from '../../../models/storage';

/**
 * Service for managing OpenID Connect authentication data in local storage.
 *
 * Provides methods to store, retrieve, and clear tokens, PKCE parameters,
 * and other OpenID Connect related data with proper namespacing.
 */
export class OpenidStorageService extends LocalStorageService {
  private readonly accessToken = 'access_token';
  private readonly idToken = 'id_token';
  private readonly refreshToken = 'refresh_token';

  private readonly tokenType = 'token_type';
  private readonly pkceState = 'pkce_state';
  private readonly pkceCodeVerifier = 'pkce_code_verifier';
  private readonly nonce = 'nonce';

  private readonly returnUrl = 'return_url';

  readonly NAMESPACE = 'auth.openid';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  setAccessToken(token: string): void {
    this.set(this.accessToken, token);
  }

  getAccessToken(): StorageData {
    return this.get(this.accessToken);
  }

  clearAccessToken(): void {
    this.remove(this.accessToken);
  }

  setIdToken(token: string): void {
    this.set(this.idToken, token);
  }

  getIdToken(): StorageData {
    return this.get(this.idToken);
  }

  clearIdToken(): void {
    this.remove(this.idToken);
  }

  setRefreshToken(token: string): void {
    this.set(this.refreshToken, token);
  }

  getRefreshToken(): StorageData {
    return this.get(this.refreshToken);
  }

  clearRefreshToken(): void {
    this.remove(this.refreshToken);
  }
  setTokenType(tokenType: string): void {
    this.set(this.tokenType, tokenType);
  }

  getTokenType(): StorageData {
    return this.get(this.tokenType);
  }

  clearTokenType(): void {
    this.remove(this.tokenType);
  }

  setPkceState(state: string): void {
    this.set(this.pkceState, state);
  }

  getPkceState(): StorageData {
    return this.get(this.pkceState);
  }

  clearPkceState(): void {
    this.remove(this.pkceState);
  }

  setPkceCodeVerifier(codeVerifier: string): void {
    this.set(this.pkceCodeVerifier, codeVerifier);
  }

  getPkceCodeVerifier(): StorageData {
    return this.get(this.pkceCodeVerifier);
  }

  clearPkceCodeVerifier(): void {
    this.remove(this.pkceCodeVerifier);
  }

  setNonce(nonce: string): void {
    this.set(this.nonce, nonce);
  }

  getNonce(): StorageData {
    return this.get(this.nonce);
  }

  clearNonce(): void {
    this.remove(this.nonce);
  }

  setReturnUrl(url: string): void {
    this.set(this.returnUrl, url);
  }

  getReturnUrl(): StorageData {
    return this.get(this.returnUrl);
  }

  clearReturnUrl(): void {
    this.remove(this.returnUrl);
  }

  clearTokens(): void {
    this.clearAccessToken();
    this.clearIdToken();
    this.clearRefreshToken();
  }
}
