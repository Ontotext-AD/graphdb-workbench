import {AutocompleteSearchResult} from '../../../models/rdf-search/autocomplete-search-result';
import {Mapper} from '../../../providers/mapper/mapper';
import {MapperProvider} from '../../../providers';
import {SuggestionListMapper} from '../../rdf-search/mapper/suggestion-list.mapper';
import {AutocompleteSearchResultResponse} from '../../../models/rdf-search/api/autocomplete-search-result-response';

/**
 * Mapper class for AutocompleteSearchResult objects.
 */
export class AutocompleteSearchResultMapper extends Mapper<AutocompleteSearchResult> {
  /**
   * Maps the input AutocompleteSearchResultResponse data to a new AutocompleteSearchResult model.
   *
   * @param data - The input AutocompleteSearchResultResponse data to be mapped.
   * @returns A new AutocompleteSearchResult instance with mapped suggestions.
   */
  mapToModel(data: AutocompleteSearchResultResponse): AutocompleteSearchResult {
    return new AutocompleteSearchResult(
      {
        ...data,
        suggestionList: MapperProvider.get(SuggestionListMapper).mapToModel(data.suggestions)
      });
  }
}
