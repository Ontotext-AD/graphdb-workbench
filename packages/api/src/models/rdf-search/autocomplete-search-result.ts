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
  }

  /**
   * Sets the hovered state of the specified suggestion to true.
   * @param suggestion - The suggestion to be highlighted.
   */
  hoverSuggestion(suggestion: Suggestion) {
    if (!suggestion || suggestion.isHovered()) {
      return;
    }
    this.clearHoveredState();
    suggestion.setHovered(true);
  }

  /**
   * Sets the hovered state of all suggestions to false.
   */
  clearHoveredState() {
    this.getSuggestions().getItems().forEach((suggestion) => suggestion.setHovered(false));
  }

  /**
   * Sets the selected state of the specified suggestion to true.
   * Clears the selected state of all other suggestions before selecting the new one.
   * If the suggestion is already selected or is null/undefined, no action is taken.
   *
   * @param suggestion - The suggestion to be selected.
   */
  selectSuggestion(suggestion: Suggestion) {
    if (!suggestion || suggestion.isSelected()) {
      return;
    }
    this.clearSelectedState();
    suggestion.setSelected(true);
  }

  private clearSelectedState() {
    this.getSuggestions().getItems().forEach((suggestion) => suggestion.setSelected(false));
  }
}
