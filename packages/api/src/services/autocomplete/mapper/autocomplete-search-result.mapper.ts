import {AutocompleteSearchResult} from '../../../models/rdf-search/autocomplete-search-result';
import {AutocompleteSearchResultResponse} from '../../../models/rdf-search/api/autocomplete-search-result-response';
import {mapSuggestionListResponseToModel} from '../../rdf-search/mapper/suggestion-list.mapper';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for AutocompleteSearchResult objects.
 */
export const mapAutocompleteSearchResultResponseToModel: MapperFn<AutocompleteSearchResultResponse, AutocompleteSearchResult> = (data) => {
  return new AutocompleteSearchResult(
    {
      ...data,
      suggestionList: mapSuggestionListResponseToModel(data.suggestions)
    });
};
