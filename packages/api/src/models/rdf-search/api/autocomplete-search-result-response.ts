import {SuggestionResponse} from './suggestion-response';
import {SuggestionList} from '../suggestion-list';

export interface AutocompleteSearchResultResponse {
  suggestions: SuggestionResponse[];

  // internal
  suggestionList: SuggestionList;
}
