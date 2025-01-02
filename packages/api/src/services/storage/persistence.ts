import {StorageData} from '../../models/storage';
import {Service} from '../../providers/service/service';

export interface Persistence extends Service {
  /**
   * Getter for the actual storage implementation, for example localStorage or sessionStorage.
   * The implementation must be compatible with the {@link Storage} interface.
   */
  getStorage(): Storage;

  /**
   * Returns the value of the given key from the storage.
   * @param key The key to get the value for.
   */
  get(key: string): StorageData;

  /**
   * Sets the value for the given key in the storage.
   * @param key The key to set the value for.
   * @param value The value to set.
   */
  set(key: string, value: string): void;

  /**
   * Removes the value for the given key from the storage.
   * @param key The key to remove the value for.
   */
  remove(key: string): void;
}
