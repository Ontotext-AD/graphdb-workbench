import {AutocompleteSearchResultMapper} from '../autocomplete-search-result.mapper';
import {Suggestion, SuggestionList, SuggestionType} from '../../../../models/rdf-search';
import {AutocompleteSearchResultResponse} from '../../../../models/rdf-search/api/autocomplete-search-result-response';

describe('Autocomplete search result mapper', () => {
  let mapper: AutocompleteSearchResultMapper;

  beforeEach(() => {
    mapper = new AutocompleteSearchResultMapper();
  });

  test('should correctly map an autocomplete search result', () => {
    // Given, I have an autocomplete search result.
    const searchResultJson = {
      suggestions: [
        {
          value: 'suggestion1',
          description: 'description1',
          type: SuggestionType.URI,
          id: -241098730,
        }
      ]
    };

    // When, I map the autocomplete search result to a model.
    const result = mapper.mapToModel(searchResultJson as AutocompleteSearchResultResponse);

    // Then, I should get a model containing the same data.
    expect(result.getSuggestions()).toEqual(new SuggestionList(searchResultJson.suggestions.map(suggestion => new Suggestion(suggestion))));
  });
});
