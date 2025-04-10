import {Suggestion} from './suggestion';
import {ModelList} from '../common';

/**
 * Represents a list of suggestions, returned from an RDF search query.
 */
export class SuggestionList extends ModelList<Suggestion> {
  constructor(suggestions?: Suggestion[]) {
    super(suggestions);
  }
}
