import {AutocompleteService} from '../autocomplete.service';
import {AutocompleteSearchResult, Suggestion, SuggestionList, SuggestionType} from '../../../models/rdf-search';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';

describe('Autocomplete service', () => {
  let autocompleteService: AutocompleteService;

  beforeEach(() => {
    autocompleteService = new AutocompleteService();
  });

  test('should return a list of suggestions when searching', async() => {
    // Given, I have mocked the autocomplete search result
    const mockSearchResult = {
      suggestions: [
        {
          value: 'suggestion1',
          description: 'description1',
          type: SuggestionType.URI,
          id: -241098730,
        },
        {
          value: 'suggestion2',
          description: 'description2',
          type: SuggestionType.PREFIX,
          id: -1906117808,
        },
      ],
    };
    const searchTerm = 'test';
    TestUtil.mockResponse(new ResponseMock(`/rest/autocomplete/query?q=${searchTerm}`).setResponse(mockSearchResult));

    // When, I call the search method
    const result = await autocompleteService.search(searchTerm);

    // Then, I expect the result to be an instance of AutocompleteSearchResult
    expect(result).toBeInstanceOf(AutocompleteSearchResult);
    // And, it should contain the expected suggestions
    expect(result.getSuggestions()).toEqual(new SuggestionList(mockSearchResult.suggestions.map((suggestion) => new Suggestion(suggestion))));
  });
});
