import {LocalStorageService} from '../../storage/local-storage.service';
import {StorageData} from '../../../models/storage';

/**
 * A service for managing authentication-related local storage operations.
 */
export class AuthenticationStorageService extends LocalStorageService {
  readonly jwtKey = 'jwt';
  readonly authenticatedKey = 'authenticated';
  readonly NAMESPACE = 'auth';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  /**
   * Retrieves the authentication token from storage.
   * @returns The stored authentication token as StorageData.
   */
  getAuthToken(): StorageData {
    return this.get(this.jwtKey);
  }

  setAuthenticated(authenticated: boolean) {
    this.storeValue(this.authenticatedKey, authenticated?.toString() || '');
  }

  isAuthenticated(): boolean {
    return this.get(this.authenticatedKey).getValue() === 'true';
  }

  setAuthToken(value: string): void {
    this.setAuthenticated(true);
    this.set(this.jwtKey, value);
  }

  clearAuthToken(): void {
    this.remove(this.jwtKey);
  }

  /**
   * Whether the storage event is a login or logout: a change of an auth key that is not a token refresh.
   *
   * @param event the storage event.
   * @returns true for a login or logout, false otherwise.
   */
  isLoginOrLogout(event: StorageEvent): boolean {
    const authKeys = [this.getPrefixedKey(this.jwtKey), this.getPrefixedKey(this.authenticatedKey)];
    return authKeys.includes(event.key ?? '') && !this.isTokenRefresh(event);
  }

  private isTokenRefresh(event: StorageEvent): boolean {
    return event.key === this.getPrefixedKey(this.jwtKey) && !!event.oldValue && !!event.newValue;
  }

  isGDBorOpenIDToken(): boolean {
    return this.isGDBToken() || this.isOpenIDToken();
  }

  isGDBToken(): boolean {
    const token = this.getAuthToken().getValue();
    return !!(token?.startsWith('GDB'));
  }

  isOpenIDToken(): boolean {
    const token = this.getAuthToken().getValue();
    return !!(token?.startsWith('Bearer'));
  }
}
