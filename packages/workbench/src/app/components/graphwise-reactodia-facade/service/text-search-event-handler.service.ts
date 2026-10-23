import {Injectable} from '@angular/core';
import {translate} from '@jsverse/transloco';
import {EventType} from 'graphwise-reactodia';
import {
  AutocompleteStorageService,
  GraphNavigatorContextService,
  navigateTo,
  OntoToastrService,
  RepositoryContextService,
  service
} from '@ontotext/workbench-api';
import {GraphwiseReactodiaEventHandler} from '../models/graphwise-reactodia-event-handler';

const AUTOCOMPLETE_NAMESPACE = 'http://www.ontotext.com/plugins/autocomplete#';

/**
 * Handles the entity text searches graphwise-reactodia reports. Warns once per repository that autocomplete is off.
 */
@Injectable()
export class TextSearchEventHandler implements GraphwiseReactodiaEventHandler<EventType.TEXT_SEARCH> {
  /** The repositories the autocomplete warning was shown for. */
  private readonly autocompleteWarnedRepositories = new Set<string | undefined>();

  private readonly autocompleteStorageService = service(AutocompleteStorageService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly graphNavigatorContextService = service(GraphNavigatorContextService);
  private readonly ontoToastrService = service(OntoToastrService);

  canHandle(type: EventType): boolean {
    return type === EventType.TEXT_SEARCH;
  }

  /**
   * Warns that autocomplete is off, if the provider settings use it and the repository was not warned for yet.
   */
  handle(): void {
    const repositoryId = this.repositoryContextService.getSelectedRepository()?.id;
    const alreadyWarned = this.autocompleteWarnedRepositories.has(repositoryId);
    if (alreadyWarned || !this.usesAutocomplete() || this.autocompleteStorageService.isEnabled()) {
      return;
    }
    this.autocompleteWarnedRepositories.add(repositoryId);
    const message = translate('graph_navigator.warnings.autocomplete_is_off');
    this.ontoToastrService.warning(`<a class="no-underline" style="font-weight: 500">${message}</a>`, {
      onClick: navigateTo('autocomplete'),
      removeOnClick: true
    });
  }

  /**
   * Whether the text search of the active repository's provider settings uses the GraphDB autocomplete index.
   */
  private usesAutocomplete(): boolean {
    const settings = this.graphNavigatorContextService.getSettings()?.getProviderSettings();
    return [
      settings?.defaultPrefix,
      settings?.fullTextSearch?.prefix,
      settings?.fullTextSearch?.queryPattern
    ].some((query) => query?.includes(AUTOCOMPLETE_NAMESPACE));
  }
}
