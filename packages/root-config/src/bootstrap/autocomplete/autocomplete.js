import {
  ServiceProvider,
  AutocompleteService,
  AutocompleteContextService,
  RepositoryStorageService,
  RepositoryContextService
} from '@ontotext/workbench-api';

/**
 * Check if autocomplete is enabled, when loading(reloading) the application.
 * Gets the current autocomplete status from the backend and updates the context with the value.
 * If there is no selected repository, the request will not be made.
 */
const isAutocompleteEnabled = () => {
  const repositoryIdSelector = ServiceProvider.get(RepositoryContextService).SELECTED_REPOSITORY_ID;
  const currentRepository = ServiceProvider.get(RepositoryStorageService).get(repositoryIdSelector).getValue();
  if (!currentRepository) {
    return Promise.resolve();
  }
  return ServiceProvider.get(AutocompleteService).isAutocompleteEnabled()
    .then((enabled) => {
      ServiceProvider.get(AutocompleteContextService).updateAutocompleteEnabled(enabled);
    });
};

export const autoCompleteBootstrap = [isAutocompleteEnabled];
