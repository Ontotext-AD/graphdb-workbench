import {
  service,
  AutocompleteService,
  AutocompleteContextService,
  RepositoryContextService,
  AuthorizationService
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;
let unsubscribeFn;

/**
 * Sets up (or re-sets) the repository selection listener and
 * synchronizes the enablement of autocomplete for the currently selected repository.
 * If already subscribed, it unsubscribes before creating a new subscription.
 *
 * @returns {Promise<void>} Resolved immediately after (re)configuration, since no waiting is needed.
 */
const setupAutocompleteSubscription = () => {
  if (unsubscribeFn) {
    unsubscribeFn();
  }
  const autocompleteContextService = service(AutocompleteContextService);
  const authorizationService = service(AuthorizationService);

  unsubscribeFn = service(RepositoryContextService).onSelectedRepositoryChanged((selectedRepository) => {
    if (!selectedRepository?.id || !authorizationService.canReadRepo(selectedRepository)) {
      autocompleteContextService.updateAutocompleteEnabled(false);
    } else {
      service(AutocompleteService).isAutocompleteEnabled()
        .then((enabled) => {
          autocompleteContextService.updateAutocompleteEnabled(enabled);
        })
        .catch((error) => {
          autocompleteContextService.updateAutocompleteEnabled(false);
          logger.error('Could not load autocomplete status', error);
        });
    }
  });
  return Promise.resolve();
};

export const autoCompleteBootstrap = [setupAutocompleteSubscription];
