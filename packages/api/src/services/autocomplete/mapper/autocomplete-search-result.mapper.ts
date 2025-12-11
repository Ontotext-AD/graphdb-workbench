import {AutocompleteSearchResult, Suggestion, SuggestionList, SuggestionType} from '../../../models/rdf-search';
import {AutocompleteSearchResultResponse} from '../response/autocomplete-search-result-response';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {GeneratorUtils} from '../../utils/generator-utils';
import {toEnum} from '../../utils';

/**
 * Mapper for AutocompleteSearchResult objects.
 */
export const mapAutocompleteSearchResultResponseToModel: MapperFn<AutocompleteSearchResultResponse, AutocompleteSearchResult> = (data) => {
  const suggestions = data.suggestions.map(suggestion => new Suggestion({
    id: GeneratorUtils.hashCode(`${suggestion.type}-${suggestion.value}-${suggestion.description}`),
    type: toEnum(SuggestionType, suggestion.type),
    value: suggestion.value,
    description: suggestion.description,
  }));
  return new AutocompleteSearchResult(new SuggestionList(suggestions));
};
