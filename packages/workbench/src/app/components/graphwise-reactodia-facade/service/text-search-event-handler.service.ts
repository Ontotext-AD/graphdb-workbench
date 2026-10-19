import {Injectable} from '@angular/core';
import {translate} from '@jsverse/transloco';
import {EventType} from 'graphwise-reactodia';
import {
  AutocompleteContextService,
  GraphNavigatorContextService,
  navigateTo,
  OntoToastrService,
  service
} from '@ontotext/workbench-api';
import {GraphwiseReactodiaEventHandler} from '../models/graphwise-reactodia-event-handler';

const AUTOCOMPLETE_NAMESPACE = 'http://www.ontotext.com/plugins/autocomplete#';

/**
 * Handles the entity text searches graphwise-reactodia reports. Warns once per repository selection that autocomplete is off.
 */
@Injectable()
export class TextSearchEventHandler implements GraphwiseReactodiaEventHandler<EventType.TEXT_SEARCH> {
  private readonly autocompleteContextService = service(AutocompleteContextService);
  private readonly graphNavigatorContextService = service(GraphNavigatorContextService);
  private readonly ontoToastrService = service(OntoToastrService);

  canHandle(type: EventType): boolean {
    return type === EventType.TEXT_SEARCH;
  }

  /**
   * Warns that autocomplete is off, if the provider settings use it and the warning was not shown yet.
   */
  handle(): void {
    if (this.graphNavigatorContextService.isAutocompleteWarned() || !this.usesAutocomplete() || this.autocompleteContextService.isAutocompleteEnabled()) {
      return;
    }
    this.graphNavigatorContextService.updateAutocompleteWarned(true);
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
