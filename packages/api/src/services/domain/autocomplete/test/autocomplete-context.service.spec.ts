import {AutocompleteContextService} from '../autocomplete-context.service';

describe('Autocomplete context service', () => {
  let autocompleteService: AutocompleteContextService;

  beforeEach(() => {
    autocompleteService = new AutocompleteContextService();
  });

  test('should update autocomplete enabled state and notify subscribers', () => {
    // Given a new autocomplete enabled state
    const enabled = true;
    const mockCallback = jest.fn();
    autocompleteService.onAutocompleteEnabledChanged(mockCallback);

    // When updating the autocomplete enabled state
    autocompleteService.updateAutocompleteEnabled(enabled);

    // Then the context should be updated and subscribers notified
    expect(mockCallback).toHaveBeenCalledWith(enabled);
  });

  test('should stop receiving updates, after unsubscribe', () => {
    // Given a new autocomplete enabled state
    const enabled = true;
    const mockCallback = jest.fn();
    const unsubscribe = autocompleteService.onAutocompleteEnabledChanged(mockCallback);
    // Clear the callback call when the callback function is registered.
    mockCallback.mockClear();

    // When unsubscribed
    unsubscribe();

    // Then the context should not receive updates
    autocompleteService.updateAutocompleteEnabled(enabled);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
