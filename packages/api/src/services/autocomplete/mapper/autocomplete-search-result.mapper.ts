import {AutocompleteSearchResult} from '../../../models/rdf-search/autocomplete-search-result';
import {Mapper} from '../../../providers/mapper/mapper';
import {SuggestionListMapper} from '../../rdf-search/mapper/suggestion-list.mapper';
import {AutocompleteSearchResultResponse} from '../../../models/rdf-search/api/autocomplete-search-result-response';
import { ensureArray, toObject } from '../../../providers/mapper/guards';
import {SuggestionResponse} from '../../../models/rdf-search/api/suggestion-response';

/**
 * Mapper class for AutocompleteSearchResult objects.
 */
export class AutocompleteSearchResultMapper extends Mapper<AutocompleteSearchResult> {
  private readonly suggestionListMapper = new SuggestionListMapper();
  /**
   * Maps the input AutocompleteSearchResultResponse data to a new AutocompleteSearchResult model.
   *
   * @param {unknown} data - The input AutocompleteSearchResultResponse data to be mapped.
   * @returns A new AutocompleteSearchResult instance with mapped suggestions.
   */
  mapToModel(data: unknown): AutocompleteSearchResult {
    if (data instanceof AutocompleteSearchResult) {
      return data;
    }
    const src = toObject<AutocompleteSearchResultResponse>(data);
    const suggestionsRaw = ensureArray<SuggestionResponse>(src.suggestions);
    const suggestionList = this.suggestionListMapper.mapToModel(suggestionsRaw);
    const response: AutocompleteSearchResultResponse = {
      ...src,
      suggestions: suggestionsRaw,
      suggestionList
    };

    return new AutocompleteSearchResult(response);
  }
}
