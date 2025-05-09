import {LocalStorageService} from '../storage';

/**
 * Service for managing autocomplete-related storage operations.
 */
export class AutocompleteStorageService extends LocalStorageService {
  private readonly ENABLED_KEY = 'enabled';

  readonly NAMESPACE = 'autocomplete';

  set(key: string, value: string): void {
    this.storeValue(key, value);
  }

  /**
   * Checks if autocomplete is enabled.
   * @returns {boolean} True if autocomplete is enabled, false otherwise.
   */
  isEnabled(): boolean {
    return this.get(this.ENABLED_KEY).value === 'true';
  }

  /**
   * Sets the value of 'autocomplete.enabled' in the local store.
   * @param value - The value to set for 'autocomplete.enabled'.
   */
  setEnabled(value: boolean): void {
    this.set(this.ENABLED_KEY, value.toString());
  }
}
