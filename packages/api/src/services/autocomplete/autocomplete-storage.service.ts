import {LocalStorageService} from '../storage';
import {Suggestion} from '../../models/rdf-search';

/**
 * Service for managing autocomplete-related storage operations.
 */
export class AutocompleteStorageService extends LocalStorageService {
  private readonly enabledKey = 'enabled';
  private readonly inputKey = 'input';
  private readonly lastSelectedKey = 'lastSelected';
  private readonly selectedViewKey = 'selectedView';
  readonly NAMESPACE = 'autocomplete';

  set(key: string, value: string): void {
    this.storeValue(key, value);
  }

  /**
   * Checks if autocomplete is enabled.
   * @returns {boolean} True if autocomplete is enabled, false otherwise.
   */
  isEnabled(): boolean {
    return this.get(this.enabledKey).value === 'true';
  }

  /**
   * Sets the value of 'autocomplete.enabled' in the local store.
   * @param value - The value to set for 'autocomplete.enabled'.
   */
  setEnabled(value: boolean): void {
    this.set(this.enabledKey, value.toString());
  }

  /**
   * Stores the current value of the rdf resource search input.
   * @param value - The input value.
   */
  setInputValue(value: string): void {
    this.set(this.inputKey, value);
  }

  /**
   * Retrieves the stored rdf resource search input value.
   * @returns {string} The stored input value or an empty string if no value is stored.
   */
  getInputValue(): string {
    return this.get(this.inputKey).getValue() || '';
  }

  /**
   * Stores the value of the last selected autocomplete suggestion.
   * @param suggestion - The Suggestion object that was last selected by the user.
   */
  setLastSelected(suggestion: Suggestion): void {
    this.set(this.lastSelectedKey, suggestion.getValue());
  }

  /**
   * Retrieves the value of the last selected autocomplete suggestion.
   * @returns {string} The value of the last selected suggestion or an empty string if no suggestion was selected.
   */
  getLastSelectedValue(): string {
    return this.get(this.lastSelectedKey).getValue() || '';
  }

  /**
   * Clears the autocomplete search history from local storage.
   * Removes both the stored input value and the last selected suggestion.
   */
  clearStoredSearch(): void {
    this.remove(this.inputKey);
    this.remove(this.lastSelectedKey);
  }

  /**
   * Sets the selected view type for the rdf search.
   * @param viewType - The type of view which is selected
   */
  setSelectedView(viewType: string) {
    this.set(this.selectedViewKey, viewType);
  }

  /**
   * Retrieves the currently selected view type for rdf search.
   * @returns {string} The current view type or an empty string if no view type is stored.
   */
  getSelectedView(): string {
    return this.get(this.selectedViewKey).getValue() || '';
  }
}
