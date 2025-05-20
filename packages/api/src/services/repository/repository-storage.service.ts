import {LocalStorageService} from '../storage';

/**
 * Service that handles the repository related properties in the local storage.
 */
export class RepositoryStorageService extends LocalStorageService {
  readonly NAMESPACE = 'repository';

  set(key: string, value: string) {
    if (!value) {
      this.remove(key);
      return;
    }
    this.storeValue(key, value);
  }
}
