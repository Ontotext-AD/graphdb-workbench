import {AutocompleteService} from '../autocomplete.service';
import {AutocompleteSearchResult, Suggestion, SuggestionList, SuggestionType} from '../../../../models/rdf-search';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';

describe('AutocompleteService', () => {
  let autocompleteService: AutocompleteService;

  beforeEach(() => {
    autocompleteService = new AutocompleteService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('search', () => {
    test('should return an AutocompleteSearchResult with mapped suggestions', async () => {
      // Given a raw response with suggestions from the REST endpoint,
      const searchTerm = 'ex';
      const rawResponse = {
        suggestions: [
          {type: 'uri', value: 'http://example.com/subject', description: 'An example URI'},
          {type: 'prefix', value: 'ex:', description: 'Example prefix'}
        ]
      };
      TestUtil.mockResponse(
        new ResponseMock(`rest/autocomplete/query?q=${searchTerm}`).setResponse(rawResponse)
      );

      // When the service is called to perform a search,
      const result = await autocompleteService.search(searchTerm);

      // Then I expect it to return an instance of AutocompleteSearchResult,
      expect(result).toBeInstanceOf(AutocompleteSearchResult);
      // with the suggestions mapped to the model.
      expect(result.suggestions).toBeInstanceOf(SuggestionList);
      expect(result.suggestions.size()).toBe(2);

      const firstSuggestion = result.suggestions.getFirstItem();
      expect(firstSuggestion).toBeInstanceOf(Suggestion);
      expect(firstSuggestion?.getType()).toBe(SuggestionType.URI);
      expect(firstSuggestion?.getValue()).toBe('http://example.com/subject');
      expect(firstSuggestion?.getDescription()).toBe('An example URI');

      const secondSuggestion = result.suggestions.getItems()[1];
      expect(secondSuggestion?.getType()).toBe(SuggestionType.PREFIX);
      expect(secondSuggestion?.getValue()).toBe('ex:');
    });

    test('should return an AutocompleteSearchResult with an empty suggestion list when there are no suggestions', async () => {
      // Given a raw response with no suggestions,
      const searchTerm = 'noresults';
      const rawResponse = {suggestions: []};
      TestUtil.mockResponse(
        new ResponseMock(`rest/autocomplete/query?q=${searchTerm}`).setResponse(rawResponse)
      );

      // When the service is called to perform a search,
      const result = await autocompleteService.search(searchTerm);

      // Then I expect it to return an instance of AutocompleteSearchResult,
      expect(result).toBeInstanceOf(AutocompleteSearchResult);
      // with an empty suggestion list.
      expect(result.suggestions.size()).toBe(0);
    });

    test('should accept an AbortSignal and complete without error', async () => {
      // Given an AbortController and a valid response,
      const searchTerm = 'abort';
      const rawResponse = {suggestions: []};
      TestUtil.mockResponse(
        new ResponseMock(`rest/autocomplete/query?q=${searchTerm}`).setResponse(rawResponse)
      );
      const controller = new AbortController();

      // When the service is called with an abort signal,
      const result = await autocompleteService.search(searchTerm, controller.signal);

      // Then I expect the search to complete successfully.
      expect(result).toBeInstanceOf(AutocompleteSearchResult);
    });
  });

  describe('isAutocompleteEnabled', () => {
    test('should return true when autocomplete is enabled', async () => {
      // Given that the REST endpoint responds with true,
      TestUtil.mockResponse(new ResponseMock('rest/autocomplete/enabled').setResponse(true));

      // When the service is called to check if autocomplete is enabled,
      const result = await autocompleteService.isAutocompleteEnabled();

      // Then I expect the result to be true.
      expect(result).toBe(true);
    });

    test('should return false when autocomplete is disabled', async () => {
      // Given that the REST endpoint responds with false,
      TestUtil.mockResponse(new ResponseMock('rest/autocomplete/enabled').setResponse(false));

      // When the service is called to check if autocomplete is enabled,
      const result = await autocompleteService.isAutocompleteEnabled();

      // Then I expect the result to be false.
      expect(result).toBe(false);
    });
  });
});
