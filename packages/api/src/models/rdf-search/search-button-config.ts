import {SearchButtonList} from './search-button-list';
import {SearchButton} from './search-button';

/**
 * Represents the configuration for search buttons.
 */
export class SearchButtonConfig {
  /** Indicates whether the buttons should behave as radio buttons. */
  isRadio: boolean;

  /** The list of search buttons. */
  buttons: SearchButtonList;

  constructor(data: { isRadio: boolean, buttons: SearchButton[] }) {
    this.isRadio = data.isRadio;
    this.buttons = new SearchButtonList(data.buttons);
  }
}
