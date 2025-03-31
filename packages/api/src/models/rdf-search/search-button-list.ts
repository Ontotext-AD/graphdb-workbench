import {ModelList} from '../common';
import {SearchButton} from './search-button';

/**
 * Represents a list of search buttons for the RDF search
 */
export class SearchButtonList extends ModelList<SearchButton> {
  /**
   * Creates a new instance of SearchButtonList.
   * @param buttons - An optional array of SearchButton objects to initialize the list.
   */
  constructor(buttons?: SearchButton[]) {
    super(buttons);
  }
}
