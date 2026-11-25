import {LocalStorageService} from '../../../storage';
import {StorageData} from '../../../../models/storage';

/**
 * Service for managing OpenID Connect authentication data in local storage.
 *
 * Provides methods to store, retrieve, and clear the tokens and the nonce, which all tabs share, with proper
 * namespacing. The data of a login in progress in one tab is in {@link OpenidSessionStorageService}.
 */
export class OpenidLocalStorageService extends LocalStorageService {
  private readonly accessToken = 'access_token';
  private readonly idToken = 'id_token';
  private readonly refreshToken = 'refresh_token';

  private readonly tokenType = 'token_type';
  private readonly nonce = 'nonce';

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

  setNonce(nonce: string): void {
    this.set(this.nonce, nonce);
  }

  getNonce(): StorageData {
    return this.get(this.nonce);
  }

  clearNonce(): void {
    this.remove(this.nonce);
  }

  clearTokens(): void {
    this.clearAccessToken();
    this.clearIdToken();
    this.clearRefreshToken();
  }
}
