import {HttpService} from '../../http/http.service';
import {AutocompleteSearchResultResponse} from './response/autocomplete-search-result-response';

/**
 * Service for handling autocomplete REST operations.
 */
export class AutocompleteRestService extends HttpService {
  private readonly autocompleteRestPrefix = 'rest/autocomplete';

  /**
   * Performs an autocomplete search based on the provided search term.
   *
   * @param searchTerm - The string to use for autocomplete search.
   * @param signal - Optional AbortSignal to cancel the request if needed.
   * @returns A Promise that resolves to an AutocompleteSearchResult object containing search suggestions.
   */
  search(searchTerm: string, signal?: AbortSignal): Promise<AutocompleteSearchResultResponse> {
    return this.get(`${this.autocompleteRestPrefix}/query`, {
      params: {
        q: searchTerm
      },
      signal,
    });
  }

  /**
   * Checks if the autocomplete feature is enabled.
   *
   * @returns A Promise that resolves to a boolean indicating whether autocomplete is enabled.
   */
  enabled(): Promise<boolean> {
    return this.get(`${this.autocompleteRestPrefix}/enabled`);
  }
}
