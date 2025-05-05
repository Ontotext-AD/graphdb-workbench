import {SearchButtonList} from './search-button-list';
import {SearchButton} from './search-button';
import {Model} from '../common';

/**
 * Represents the configuration for search buttons.
 */
export class SearchButtonConfig extends Model<SearchButtonConfig> {
  /** Indicates whether the buttons should behave as radio buttons. */
  private radio!: boolean;

  /** The list of search buttons. */
  private buttons!: SearchButtonList;

  constructor(data: { isRadio: boolean, buttons: SearchButton[] }) {
    super();
    this.setRadio(data.isRadio);
    this.setButtons(new SearchButtonList(data.buttons));
  }

  getButtons() {
    return this.buttons;
  }

  setButtons(buttons: SearchButtonList) {
    this.buttons = buttons;
  }

  isRadio() {
    return this.radio;
  }

  setRadio(isRadio: boolean) {
    this.radio = isRadio;
  }

  selectButton(button: SearchButton) {
    if (this.isRadio() && !button.selected) {
      this.deselectAll();
      button.selected = true;
      button.callback();
    }
    return this.copy();
  }

  private deselectAll() {
    this.buttons.getItems().forEach((btn) => btn.selected = false);
  }
}
