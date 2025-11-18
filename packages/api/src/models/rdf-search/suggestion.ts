import {Model} from '../common';
import {SuggestionType} from './suggestion-type';
import {SuggestionInit} from './api/suggestion-response';

/**
 * Represents a suggestion in the RDF search functionality.
 */
export class Suggestion extends Model<Suggestion> {
  /** Unique identifier for the suggestion. */
  private _id?: number;

  /** The type of the suggestion. */
  private _type!: SuggestionType;

  /** The value of the suggestion. */
  private _value!: string;

  /** A description of the suggestion. */
  private _description?: string;

  /** Whether the suggestion is hovered. The hovered suggestion is the subject of action on key press */
  private _hovered?: boolean;

  /** Under some conditions (holding ctrlKey/metaKey, when selecting) the suggestion needs to be opened in
   * the Graph visualization view, regardless, of the selected mode
   */
  private overrideToVisual = false;

  /** Whether the suggestion has been selected. When clicked, the suggestion will be selected */
  private _selected?: boolean;

  constructor(data: SuggestionInit) {
    super();

    if (data.id !== null) {
      this.setId(data.id);
    }

    if (data.type !== null) {
      this.setType(data.type);
    }

    if (data.value !== null) {
      this.setValue(data.value);
    }

    if (data.description !== null) {
      this.setDescription(data.description);
    }
  }

  getId(): number | undefined {
    return this._id;
  }

  setId(id?: number): void {
    this._id = id;
  }

  getType(): SuggestionType {
    return this._type;
  }

  setType(type: SuggestionType): void {
    this._type = type;
  }

  getValue(): string {
    return this._value;
  }

  setValue(value: string): void {
    this._value = value;
  }

  getDescription(): string | undefined {
    return this._description;
  }

  setDescription(description?: string): void {
    this._description = description;
  }

  isHovered(): boolean | undefined {
    return this._hovered;
  }

  setHovered(hovered: boolean): void {
    this._hovered = hovered;
  }

  isSelected(): boolean | undefined {
    return this._selected;
  }

  setSelected(selected: boolean): void {
    this._selected = selected;
  }

  getOverrideToVisual(): boolean {
    return this.overrideToVisual;
  }

  setOverrideToVisual(override: boolean): void {
    this.overrideToVisual = override;
  }
}
