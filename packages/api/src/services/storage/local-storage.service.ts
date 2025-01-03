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
   * The namespace is used to scope keys for the persistent properties by component or view. Each persistence service
   * should define a namespace to be used for the keys in the localStorage.
   */
  abstract get NAMESPACE(): string;

  /**
   * Sets the value for the given key in the localStorage.
   * Each implementation must implement this method to store the value in the localStorage by invoking the
   * LocalStorageService.storeValue method and eventually doing some additional work if needed, for example, notifying
   * other services about the change.
   * @param key The key to set the value for. Every key must be prefixed with {@link StorageKey.GLOBAL_NAMESPACE}.
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
   * @param key The key to get the value for. Every key must be prefixed with {@link StorageKey.GLOBAL_NAMESPACE}.
   */
  get(key: string): StorageData {
    const value = this.getStorage().getItem(this.getPrefixedKey(key));
    return new StorageData(value);
  }

  /**
   * Stores the value for the given key in the localStorage.
   * @param key The key to set the value for. Every key must be prefixed with {@link StorageKey.GLOBAL_NAMESPACE}.
   * @param value The value to set.
   */
  storeValue(key: string, value: string): void {
    this.getStorage().setItem(this.getPrefixedKey(key), value);
  }

  /**
   * Removes the value for the given key from the localStorage.
   * @param key The key to remove the value for. Every key must be prefixed with {@link StorageKey.GLOBAL_NAMESPACE}.
   */
  remove(key: string): void {
    this.getStorage().removeItem(this.getPrefixedKey(key));
  }

  private getPrefixedKey(key: string): string {
    const globalLocalPrefix = `${StorageKey.GLOBAL_NAMESPACE}.${this.NAMESPACE}.`;
    const localPrefix = `${this.NAMESPACE}.`;

    // If the key is already prefixed with the global and local namespaces, return as is
    if (key.startsWith(globalLocalPrefix)) {
      return key;
    }

    // If the key is prefixed with the local namespace only, add the global namespace
    if (key.startsWith(localPrefix)) {
      return `${StorageKey.GLOBAL_NAMESPACE}.${key}`;
    }

    // If the key is unprefixed, add both global and local namespaces
    return `${globalLocalPrefix}${key}`;
  }
}
