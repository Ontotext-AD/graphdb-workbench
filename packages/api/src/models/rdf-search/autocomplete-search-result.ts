import {Model} from '../common';
import {SuggestionList} from './suggestion-list';
import {Suggestion} from './suggestion';

/**
 * Represents an RDF search result containing suggestions.
 */
export class AutocompleteSearchResult extends Model<AutocompleteSearchResult> {
  /** The list of suggestions associated with this search result. */
  suggestions: SuggestionList;

  constructor(data: SuggestionList) {
    super();
    this.suggestions = data;
  }

  /**
   * Sets the hovered state of the first suggestion to true, if present.
   */
  hoverFirstSuggestion() {
    const firstSuggestion = this.suggestions.getFirstItem();
    if (firstSuggestion) {
      return this.hoverSuggestion(firstSuggestion);
    }
  }

  /**
   * Sets the hovered state of the specified suggestion to true.
   * @param suggestion - The suggestion to be highlighted.
   */
  hoverSuggestion(suggestion: Suggestion) {
    if (suggestion) {
      this.clearHoveredState();
      suggestion.setHovered(true);
    }
    return this.copy();
  }

  /**
   * Sets the selected state of the specified suggestion to true.
   * Clears the selected state of all other suggestions before selecting the new one.
   * If the suggestion is already selected or is null/undefined, no action is taken.
   *
   * @param suggestion - The suggestion to be selected.
   */
  selectSuggestion(suggestion: Suggestion) {
    if (suggestion) {
      this.clearSelectedState();
      suggestion.setSelected(true);
    }
    return this.copy();
  }

  /**
   * Returns the selected suggestion from the list, if any.
   * @return The selected suggestion, or undefined if no suggestion is selected.
   */
  getHoveredSuggestion(): Suggestion | undefined {
    return this.suggestions.findHoveredSuggestion();
  }

  /**
   * Moves the hover state to the previous suggestion in the list.
   * If the currently hovered suggestion is the first one or no suggestion is hovered,
   * no action is taken.
   */
  hoverPreviousSuggestion() {
    const currentIndex = this.suggestions.getHoveredSuggestionIndex();
    if (currentIndex > 0) {
      this.clearHoveredState();
      this.suggestions.setHoveredStateAtIndex(currentIndex - 1, true);
    }
    return this.copy();
  }

  /**
   * Moves the hover state to the next suggestion in the list.
   * If the currently hovered suggestion is the last one or no suggestion is hovered,
   * no action is taken.
   */
  hoverNextSuggestion() {
    const currentIndex = this.suggestions.getHoveredSuggestionIndex();
    if (currentIndex < this.suggestions.size() - 1) {
      this.clearHoveredState();
      this.suggestions.setHoveredStateAtIndex(currentIndex + 1, true);
    }
    return this.copy();
  }

  /**
   * Clears the selected state of all suggestions.
   */
  clearSuggestions() {
    this.suggestions = new SuggestionList();
    return this.copy();
  }

  /**
   * Finds a suggestion by its value.
   * @param value - The value of the suggestion to find.
   * @returns The suggestion with the specified value, or undefined if not found.
   */
  getByValue(value: string): Suggestion | undefined {
    return this.suggestions.findSuggestionByValue(value);
  }

  private clearSelectedState() {
    this.suggestions.deselectAllSuggestions();
  }

  /**
   * Sets the hovered state of all suggestions to false.
   */
  private clearHoveredState() {
    this.suggestions.unhoverAllSuggestions();
  }
}
