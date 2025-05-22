import {
  ServiceProvider,
  AutocompleteService,
  AutocompleteContextService,
  RepositoryStorageService
} from '@ontotext/workbench-api';

/**
 * Check if autocomplete is enabled, when loading(reloading) the application.
 * Gets the current autocomplete status from the backend and updates the context with the value.
 * If there is no selected repository, the request will not be made.
 */
// TODO: Consider refactoring the code, adding a subscription to the selected repository change event, and updating the autocomplete status.
const isAutocompleteEnabled = () => {
  const currentRepository = ServiceProvider.get(RepositoryStorageService).getRepositoryReference();

  if (!currentRepository.id) {
    return Promise.resolve();
  }
  return ServiceProvider.get(AutocompleteService).isAutocompleteEnabled()
    .then((enabled) => {
      ServiceProvider.get(AutocompleteContextService).updateAutocompleteEnabled(enabled);
    });
};

export const autoCompleteBootstrap = [isAutocompleteEnabled];
