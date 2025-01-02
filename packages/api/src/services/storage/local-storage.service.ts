import {StorageData} from '../../models/storage';
import {Persistence} from './persistence';
import {StorageKey} from '../../models/storage';

/**
 * Persistence implementation backed by the localStorage API.
 * In most cases, this class should not be used directly but extended by a service that provides additional specific
 * functionality and keys.
 */
export abstract class LocalStorageService implements Persistence {
  /**
   * Returns the key to use for the localStorage.
   * Each concrete implementation should implement this method to return a key prefixed with some domain related
   * namespace. For example, the language storage service could return 'i18n.'.
   * @param key The key to be prefixed with the local namespace.
   */
  abstract getLocalKey(key: string): string;

  /**
   * Sets the value for the given key in the localStorage.
   * Each implementation must implement this method to store the value in the localStorage by invoking the
   * LocalStorageService.storeValue method and eventually doing some additional work if needed, for example, notifying
   * other services about the change.
   * @param key The key to set the value for. Every key must be prefixed with {@link StorageKey.namespace}.
   * @param value The value to set.
   */
  abstract set(key: string, value: string): void;

  /**
   * Getter for the localStorage implementation.
   */
  getStorage(): Storage {
    return localStorage;
  }

  /**
   * Returns the value of the given key from the localStorage.
   * @param key The key to get the value for. Every key must be prefixed with {@link StorageKey.namespace}.
   */
  get(key: string): StorageData {
    const value = this.getStorage().getItem(this.getPrefixedKey(this.getLocalKey(key)));
    return new StorageData(value);
  }

  /**
   * Stores the value for the given key in the localStorage.
   * @param key The key to set the value for. Every key must be prefixed with {@link StorageKey.namespace}.
   * @param value The value to set.
   */
  storeValue(key: string, value: string): void {
    const prefixedKey = this.getPrefixedKey(key);
    this.getStorage().setItem(prefixedKey, value);
  }

  /**
   * Removes the value for the given key from the localStorage.
   * @param key The key to remove the value for. Every key must be prefixed with {@link StorageKey.namespace}.
   */
  remove(key: string): void {
    this.getStorage().removeItem(this.getPrefixedKey(this.getLocalKey(key)));
  }

  private getPrefixedKey(key: string): string {
    if (!key.startsWith(StorageKey.namespace)) {
      return StorageKey.prefix(key);
    }
    return key;
  }
}
