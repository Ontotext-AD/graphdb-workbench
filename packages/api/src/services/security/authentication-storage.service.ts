import {LocalStorageService} from '../storage';
import {StorageData} from '../../models/storage';

/**
 * A service for managing authentication-related local storage operations.
 */
export class AuthenticationStorageService extends LocalStorageService {
  private readonly jwtKey = 'jwt';
  private readonly authenticatedKey = 'authenticated';
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
    this.set(this.jwtKey, value);
  }
}
