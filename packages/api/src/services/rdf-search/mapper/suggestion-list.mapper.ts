import {SuggestionList} from '../../../models/rdf-search/suggestion-list';
import {Mapper} from '../../../providers/mapper/mapper';
import {Suggestion} from '../../../models/rdf-search/suggestion';
import {GeneratorUtils} from '../../utils/generator-utils';
import {SuggestionResponse} from '../../../models/rdf-search';

/**
 * Mapper class for converting an array of Suggestion objects to a SuggestionList model.
 */
export class SuggestionListMapper extends Mapper<SuggestionList> {
  /**
   * Maps an array of SuggestionResponse objects to a SuggestionList model.
   *
   * @param data - An array of SuggestionResponse objects to be converted into a SuggestionList.
   * @returns A new SuggestionList instance containing the provided Suggestion objects.
   */
  mapToModel(data: SuggestionResponse[]): SuggestionList {
    const suggestions = data.map(suggestion =>
      new Suggestion({
        id: suggestion.id ?? GeneratorUtils.hashCode(
          `${suggestion.type}-${suggestion.value}-${suggestion.description}`
        ),
        type: suggestion.type,
        value: suggestion.value,
        description: suggestion.description,
      })
    );

    return new SuggestionList(suggestions);
  }
}
