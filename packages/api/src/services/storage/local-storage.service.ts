import {BrowserStorageService} from './browser-storage.service';

/**
 * Persistence implementation backed by the localStorage API. Values are shared by all tabs of the application.
 * In most cases, this class should not be used directly but extended by a service that provides additional specific
 * functionality and keys.
 */
export abstract class LocalStorageService extends BrowserStorageService {
  /**
   * Getter for the localStorage implementation.
   * @returns The localStorage.
   */
  getStorage(): Storage {
    return localStorage;
  }
}
