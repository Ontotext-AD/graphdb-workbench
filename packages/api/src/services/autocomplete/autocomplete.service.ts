import {Service} from '../../providers/service/service';
import {AutocompleteSearchResult} from '../../models/rdf-search';
import {ServiceProvider} from '../../providers';
import {AutocompleteRestService} from './autocomplete-rest.service';
import {mapAutocompleteSearchResultResponseToModel} from './mapper/autocomplete-search-result.mapper';
import {AutocompleteSearchResultResponse} from './response/autocomplete-search-result-response';

/**
 * Service responsible for handling autocomplete functionality in the RDF search.
 */
export class AutocompleteService implements Service {
  /**
   * Performs an autocomplete search based on the provided search term.
   * This method fetches autocomplete suggestions from the REST service and maps
   * the results to the AutocompleteSearchResult.
   *
   * @param searchTerm - The string to use as the basis for autocomplete suggestions
   * @returns A promise that resolves to an AutocompleteSearchResult containing the matching suggestions
   */
  search(searchTerm: string): Promise<AutocompleteSearchResult> {
    return ServiceProvider.get(AutocompleteRestService).search(searchTerm)
      .then((autocompleteResponse: AutocompleteSearchResultResponse) => mapAutocompleteSearchResultResponseToModel(autocompleteResponse));
  }

  /**
   * Checks if the autocomplete functionality is enabled.
   *
   * This method queries the AutocompleteRestService to determine
   * whether the autocomplete feature is currently enabled.
   *
   * @returns A promise that resolves to a boolean value.
   */
  isAutocompleteEnabled(): Promise<boolean> {
    return ServiceProvider.get(AutocompleteRestService).enabled();
  }
}
