import {BrowserStorageService} from './browser-storage.service';

/**
 * Persistence implementation backed by the sessionStorage API. Each tab has its own values, which survive a reload
 * and a redirect to another site and back in the same tab.
 * In most cases, this class should not be used directly but extended by a service that provides additional specific
 * functionality and keys.
 */
export abstract class SessionStorageService extends BrowserStorageService {
  /**
   * Getter for the sessionStorage implementation.
   * @returns The sessionStorage of the current tab.
   */
  getStorage(): Storage {
    return sessionStorage;
  }
}
