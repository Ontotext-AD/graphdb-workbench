import {SuggestionList} from '../../../models/rdf-search/suggestion-list';
import {Mapper} from '../../../providers/mapper/mapper';
import {Suggestion} from '../../../models/rdf-search/suggestion';
import {GeneratorUtils} from '../../utils/generator-utils';
import {SuggestionResponse} from '../../../models/rdf-search/api/suggestion-response';

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
  mapToModel(data: SuggestionResponse[] | SuggestionList): SuggestionList {
    if (data instanceof SuggestionList) {
      return data;
    }

    const suggestions = data.map(s => new Suggestion({
      ...s,
      id: GeneratorUtils.hashCode(`${s.type}-${s.value}-${s.description}`)
    }));

    return new SuggestionList(suggestions);
  }
}
