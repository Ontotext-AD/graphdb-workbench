import {Suggestion} from './suggestion';
import {ModelList} from '../common';

/**
 * Represents a list of suggestions, returned from an RDF search query.
 */
export class SuggestionList extends ModelList<Suggestion> {
  constructor(suggestions?: Suggestion[]) {
    super(suggestions);
  }

  /**
   * Finds a suggestion by its value.
   * @param value - The value to search for.
   * @return The suggestion with the specified value, or undefined if not found.
   */
  findSuggestionByValue(value: string): Suggestion | undefined {
    return this.items.find((item: Suggestion) => item.getValue() === value);
  }

  /**
   * Returns the hovered suggestion from the list, if any.
   * @return The hovered suggestion, or undefined if no suggestion is hovered.
   */
  findHoveredSuggestion(): Suggestion | undefined {
    return this.items.find((item: Suggestion) => item.isHovered());
  }

  /**
   * Returns the index of the hovered suggestion from the list, or -1 if none is hovered.
   * @return The index of the hovered suggestion, or -1 if no suggestion is hovered.
   */
  getHoveredSuggestionIndex(): number {
    return this.items.findIndex((item: Suggestion) => item.isHovered());
  }

  /**
   * Sets the hovered state of the suggestion at the specified index.
   * @param index - The index of the suggestion to update.
   * @param isHovered - The new hovered state to set.
   */
  setHoveredStateAtIndex(index: number, isHovered: boolean): void {
    const suggestion = this.items[index];
    if (suggestion) {
      suggestion.setHovered(isHovered);
    }
  }

  /**
   * Clears the hovered state of all suggestions in the list.
   */
  unhoverAllSuggestions(): void {
    this.items.forEach((item: Suggestion) => item.setHovered(false));
  }

  /**
   * Clears the selected state of all suggestions in the list.
   */
  deselectAllSuggestions(): void {
    this.items.forEach((item: Suggestion) => item.setSelected(false));
  }
}
