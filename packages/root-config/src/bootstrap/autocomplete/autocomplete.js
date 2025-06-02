import {
  ServiceProvider,
  AutocompleteService,
  AutocompleteContextService,
  RepositoryContextService
} from '@ontotext/workbench-api';

/**
 * Check if autocomplete is enabled, when loading(reloading) the application.
 * Gets the current autocomplete status from the backend and updates the context with the value.
 * If there is no selected repository, the request will not be made.
 */
const isAutocompleteEnabled = () => {
  return new Promise((resolve, reject) => {
    ServiceProvider.get(RepositoryContextService).onSelectedRepositoryChanged((selectedRepository) => {
      if (!selectedRepository?.id) {
        ServiceProvider.get(AutocompleteContextService).updateAutocompleteEnabled(false);
        return resolve();
      }
      ServiceProvider.get(AutocompleteService).isAutocompleteEnabled()
        .then((enabled) => {
          ServiceProvider.get(AutocompleteContextService).updateAutocompleteEnabled(enabled);
          resolve();
        }).catch(reject);
    });
  });
};

export const autoCompleteBootstrap = [isAutocompleteEnabled];
