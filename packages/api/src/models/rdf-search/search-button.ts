import {Model} from '../common';

/**
 * Represents a search button in the RDF search interface.
 * @extends Model<SearchButton>
 */
export class SearchButton extends Model<SearchButton> {
  /** the id of the button */
  id: string;

  /** The label text displayed on the button */
  label: string;

  /** Indicates whether the button is currently selected */
  selected: boolean;

  /** The function to be called when the button is activated */
  callback: () => void;

  constructor(data: SearchButton) {
    super();
    this.id = data.id;
    this.label = data.label;
    this.selected = data.selected;
    this.callback = data.callback;
  }
}
