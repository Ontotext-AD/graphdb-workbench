import {SuggestionList} from '../../../models/rdf-search/suggestion-list';
import {Suggestion} from '../../../models/rdf-search/suggestion';
import {GeneratorUtils} from '../../utils/generator-utils';
import {SuggestionResponse} from '../../../models/rdf-search/api/suggestion-response';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting an array of Suggestion objects to a SuggestionList model.
 */
export const mapSuggestionListResponseToModel: MapperFn<SuggestionResponse[], SuggestionList> = (data) => {
  return new SuggestionList(data.map(suggestion => new Suggestion({
    ...suggestion,
    id: GeneratorUtils.hashCode(`${suggestion.type}-${suggestion.value}-${suggestion.description}`)
  })));
};
