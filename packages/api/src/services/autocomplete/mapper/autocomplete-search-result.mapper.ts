import {AutocompleteSearchResult} from '../../../models/rdf-search/autocomplete-search-result';
import {Mapper} from '../../../providers/mapper/mapper';
import {SuggestionListMapper} from '../../rdf-search/mapper/suggestion-list.mapper';
import {AutocompleteSearchResultResponse} from '../../../models/rdf-search/api/autocomplete-search-result-response';

/**
 * Mapper class for AutocompleteSearchResult objects.
 */
export class AutocompleteSearchResultMapper extends Mapper<AutocompleteSearchResult> {
  private readonly suggestionListMapper = new SuggestionListMapper();
  /**
   * Maps the input AutocompleteSearchResultResponse data to a new AutocompleteSearchResult model.
   *
   * @param {AutocompleteSearchResultResponse} data - The input AutocompleteSearchResultResponse data to be mapped.
   * @returns A new AutocompleteSearchResult instance with mapped suggestions.
   */
  mapToModel(data: AutocompleteSearchResultResponse): AutocompleteSearchResult {
    const suggestionList = this.suggestionListMapper.mapToModel(data.suggestions);

    return new AutocompleteSearchResult({
      suggestionList
    });
  }
}
