import {LocalStorageService} from '../storage';
import {Suggestion} from '../../models/rdf-search';

/**
 * Service for managing resource search-related data in local storage.
 */
export class ResourceSearchStorageService extends LocalStorageService {
  private readonly SELECTED_VIEW_KEY = 'selectedView';
  private readonly INPUT_KEY = 'input';
  private readonly LAST_SELECTED_KEY = 'lastSelected';
  NAMESPACE = 'resourceSearch';

  set(key: string, value: string): void {
    this.storeValue(key, value);
  }

  /**
   * Sets the selected view type for the rdf search.
   * @param viewType - The type of view which is selected
   */
  setSelectedView(viewType: string) {
    this.set(this.SELECTED_VIEW_KEY, viewType);
  }

  /**
   * Retrieves the currently selected view type for rdf search.
   * @returns {string} The current view type or an empty string if no view type is stored.
   */
  getSelectedView(): string {
    return this.get(this.SELECTED_VIEW_KEY).getValue() || '';
  }

  /**
   * Stores the current value of the resource search input.
   * @param value - The input value.
   */
  setInputValue(value: string): void {
    this.set(this.INPUT_KEY, value);
  }

  /**
   * Retrieves the stored resource search input value.
   * @returns {string} The stored input value or an empty string if no value is stored.
   */
  getInputValue(): string {
    return this.get(this.INPUT_KEY).getValue() || '';
  }

  /**
   * Stores the value of the last selected autocomplete suggestion.
   * @param suggestion - The Suggestion object that was last selected by the user.
   */
  setLastSelected(suggestion: Suggestion): void {
    this.set(this.LAST_SELECTED_KEY, suggestion.getValue());
  }

  /**
   * Retrieves the value of the last selected autocomplete suggestion.
   * @returns {string} The value of the last selected suggestion or an empty string if no suggestion was selected.
   */
  getLastSelectedValue(): string {
    return this.get(this.LAST_SELECTED_KEY).getValue() || '';
  }

  /**
   * Clears the autocomplete search history from local storage.
   * Removes both the stored input value and the last selected suggestion.
   */
  clearStoredSearch(): void {
    this.remove(this.INPUT_KEY);
    this.remove(this.LAST_SELECTED_KEY);
  }
}
