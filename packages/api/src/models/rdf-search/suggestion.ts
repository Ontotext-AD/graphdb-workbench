import {Model} from '../common';
import {SuggestionType} from './suggestion-type';
import {SuggestionResponse} from './api/suggestion-response';

/**
 * Represents a suggestion in the RDF search functionality.
 */
export class Suggestion extends Model<Suggestion> {
  /** Unique identifier for the suggestion. */
  private _id!: number;

  /** The type of the suggestion. */
  private _type!: SuggestionType;

  /** The value of the suggestion. */
  private _value!: string;

  /** A description of the suggestion. */
  private _description!: string;

  /** Whether the suggestion is hovered. The hovered suggestion is the subject of action on key press */
  private _hovered?: boolean;

  /** Whether the suggestion has been selected. When clicked, the suggestion will be selected */
  private _selected?: boolean;

  constructor(data: SuggestionResponse) {
    super();
    this.setId(data.id);
    this.setType(data.type);
    this.setValue(data.value);
    this.setDescription(data.description);
  }

  getId(): number {
    return this._id;
  }

  setId(id: number): void {
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

  getDescription(): string {
    return this._description;
  }

  setDescription(description: string): void {
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
}
