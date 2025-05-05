import {Model} from '../common';
import {SuggestionList} from './suggestion-list';
import {AutocompleteSearchResultResponse} from './api/autocomplete-search-result-response';
import {Suggestion} from './suggestion';

/**
 * Represents an RDF search result containing suggestions.
 */
export class AutocompleteSearchResult extends Model<AutocompleteSearchResult> {
  /** The list of suggestions associated with this search result. */
  private _suggestions!: SuggestionList;

  constructor(searchResult: AutocompleteSearchResultResponse) {
    super();
    this.setSuggestions(searchResult.suggestionList);
  }

  getSuggestions(): SuggestionList {
    return this._suggestions;
  }

  setSuggestions(suggestions: SuggestionList) {
    this._suggestions = suggestions;
  }

  /**
   * Sets the hovered state of the first suggestion to true, if present.
   */
  hoverFirstSuggestion() {
    this.hoverSuggestion(this.getSuggestions().getItems()[0]);
    return this.copy();
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
    return this.getSuggestions().getItems().find((suggestion) => suggestion.isHovered());
  }

  /**
   * Moves the hover state to the previous suggestion in the list.
   * If the currently hovered suggestion is the first one or no suggestion is hovered,
   * no action is taken.
   */
  hoverPreviousSuggestion() {
    const currentIndex = this.getSuggestions().getItems().findIndex((suggestion) => suggestion.isHovered());
    if (currentIndex > 0) {
      this.clearHoveredState();
      this.getSuggestions().getItems()[currentIndex - 1].setHovered(true);
    }
    return this.copy();
  }

  /**
   * Moves the hover state to the next suggestion in the list.
   * If the currently hovered suggestion is the last one or no suggestion is hovered,
   * no action is taken.
   */
  hoverNextSuggestion() {
    const currentIndex = this.getSuggestions().getItems().findIndex((suggestion) => suggestion.isHovered());
    if (currentIndex < this.getSuggestions().getItems().length - 1) {
      this.clearHoveredState();
      this.getSuggestions().getItems()[currentIndex + 1].setHovered(true);
    }
    return this.copy();
  }

  /**
   * Clears the selected state of all suggestions.
   */
  clearSuggestions() {
    this.setSuggestions(new SuggestionList());
    return this.copy();
  }

  private clearSelectedState() {
    this.getSuggestions().getItems().forEach((suggestion) => suggestion.setSelected(false));
  }

  /**
   * Sets the hovered state of all suggestions to false.
   */
  private clearHoveredState() {
    this.getSuggestions().getItems().forEach((suggestion) => suggestion.setHovered(false));
  }
}
