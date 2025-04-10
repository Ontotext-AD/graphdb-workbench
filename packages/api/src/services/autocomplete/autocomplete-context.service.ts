import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {ServiceProvider} from '../../providers';
import {AutocompleteStorageService} from './autocomplete-storage.service';

type AutocompleteContextFields = {
  readonly AUTOCOMPLETE_ENABLED: string;
}

type AutocompleteContextFieldParams = {
  readonly AUTOCOMPLETE_ENABLED: boolean;
};

/**
 * Service for managing autocomplete context state across the application.
 */
export class AutocompleteContextService extends ContextService<AutocompleteContextFields> implements DeriveContextServiceContract<AutocompleteContextFields, AutocompleteContextFieldParams> {
  /**
   * Context property key for the autocomplete enabled state.
   */
  readonly AUTOCOMPLETE_ENABLED = 'isAutocompleteEnabled';

  /**
   * Updates the autocomplete enabled state in the context and in the local store
   *
   * @param enabled - Boolean value indicating whether autocomplete is enabled
   */
  updateAutocompleteEnabled(enabled: boolean): void {
    this.updateContextProperty(this.AUTOCOMPLETE_ENABLED, enabled);
    ServiceProvider.get(AutocompleteStorageService).setEnabled(enabled);
  }

  /**
   * Subscribes to changes in the autocomplete enabled state.
   *
   * @param callbackFn - Callback function that will be invoked when the autocomplete enabled state changes
   * @returns A function that can be called to unsubscribe from the changes
   */
  onAutocompleteEnabledChanged(callbackFn: ValueChangeCallback<boolean | undefined>): () => void {
    return this.subscribe(this.AUTOCOMPLETE_ENABLED, callbackFn);
  }
}
