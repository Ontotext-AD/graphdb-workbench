import {LocalStorageService} from '../storage';
import {StorageData} from '../../models/storage';

/**
 * A service for managing authentication-related local storage operations.
 */
export class AuthenticationStorageService extends LocalStorageService {
  private readonly jwtKey = 'jwt';
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
}
