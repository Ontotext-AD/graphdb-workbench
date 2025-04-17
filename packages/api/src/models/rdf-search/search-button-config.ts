import {SearchButtonList} from './search-button-list';
import {SearchButton} from './search-button';

/**
 * Represents the configuration for search buttons.
 */
export class SearchButtonConfig {
  /** Indicates whether the buttons should behave as radio buttons. */
  private radio!: boolean;

  /** The list of search buttons. */
  private buttons!: SearchButtonList;

  constructor(data: { isRadio: boolean, buttons: SearchButton[] }) {
    this.setRadio(data.isRadio);
    this.setButtons(new SearchButtonList(data.buttons));
  }

  deselectAll() {
    this.buttons.getItems().forEach((btn) => btn.selected = false);
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
}
