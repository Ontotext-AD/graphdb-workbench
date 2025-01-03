import {LocalStorageService} from '../storage';

/**
 * Service that handles the language related properties in the local storage.
 */
export class LanguageStorageService extends LocalStorageService {
  readonly NAMESPACE = 'i18n';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }
}
