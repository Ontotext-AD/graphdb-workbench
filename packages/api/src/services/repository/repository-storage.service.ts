import {LocalStorageService} from '../storage';
import {RepositoryReference} from '../../models/repositories';

/**
 * Service that handles the repository related properties in the local storage.
 */
export class RepositoryStorageService extends LocalStorageService {
  readonly NAMESPACE = 'repository';

  /** Key under which the selected repository reference is stored. */
  readonly SELECTED_REPOSITORY = 'selectedRepository';

  /**
   * Sets a value in local storage for the given key. If the value is falsy, the key is removed instead.
   *
   * @param {string} key - The key under which to store the value.
   * @param {string} value - The value to store. If falsy, the key will be removed.
   */
  set(key: string, value: string | null): void {
    if (!value) {
      this.remove(key);
      return;
    }
    this.storeValue(key, value);
  }

  /**
   * Serializes and stores a RepositoryReference in local storage.
   *
   * @param {RepositoryReference} repositoryReference - The repository reference to store.
   */
  setRepositoryReference(repositoryReference: RepositoryReference): void {
    this.set(
      this.SELECTED_REPOSITORY,
      this.serializeRepositoryReference(repositoryReference)
    );
  }

  /**
   * Retrieves and deserializes the stored RepositoryReference from local storage.
   *
   * @returns {RepositoryReference | undefined} The deserialized repository reference, or undefined if not found.
   */
  getRepositoryReference(): RepositoryReference | undefined {
    return this.deserializeRepositoryReference(
      this.get(this.SELECTED_REPOSITORY).getValueOrDefault('{"id": "", "location": ""}')
    );
  }

  /**
   * Removes the stored RepositoryReference from local storage.
   */
  removeRepositoryReference(): void {
    this.remove(this.SELECTED_REPOSITORY);
  }

  private serializeRepositoryReference(repositoryReference: RepositoryReference): string {
    return JSON.stringify(repositoryReference);
  }

  private deserializeRepositoryReference(serializedRepositoryReference?: string | null): RepositoryReference | undefined {
    if (typeof serializedRepositoryReference === 'string') {
      try {
        return JSON.parse(serializedRepositoryReference);
      } catch (e) {
        console.error('Error parsing repository reference', e);
      }
    }
    return undefined;
  }
}
