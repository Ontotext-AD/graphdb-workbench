import {SuggestionListMapper} from '../suggestion-list.mapper';
import {SuggestionList} from '../../../../models/rdf-search/suggestion-list';
import {Suggestion} from '../../../../models/rdf-search/suggestion';
import {SuggestionType} from '../../../../models/rdf-search/suggestion-type';

describe('SuggestionListMapper', () => {
  let mapper: SuggestionListMapper;

  beforeEach(() => {
    mapper = new SuggestionListMapper();
  });

  test('should correctly map an array of Suggestion objects', () => {
    // Given, I have an array of Suggestion objects.
    const suggestionsJson = [
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
      }
    ];

    // When, I map the array of Suggestion objects to a SuggestionList.
    const result = mapper.mapToModel(suggestionsJson);

    // Then, I should get suggestion list containing the same data.
    expect(result).toBeInstanceOf(SuggestionList);

    // And each suggestion should be an instance of Suggestion and contain the correct data.
    result.getItems().forEach(((suggestion, index) => {
      expect(suggestion).toBeInstanceOf(Suggestion);
      expect(suggestion).toEqual(new Suggestion(suggestionsJson[index]));
    }));
  });
});
