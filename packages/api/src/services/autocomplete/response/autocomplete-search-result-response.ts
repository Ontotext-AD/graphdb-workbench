import {SuggestionResponse} from './suggestion-response';

export interface AutocompleteSearchResultResponse {
  /**
   * The list of suggestions returned from the autocomplete search.
   */
  suggestions: SuggestionResponse[];
}
