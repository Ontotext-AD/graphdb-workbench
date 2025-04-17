import {Suggestion} from './suggestion';

/**
 * Event payload for when a suggestion is selected.
 */
export class SuggestionSelectedPayload {
  private suggestion!: Suggestion;
  private context!: string;

  constructor(suggestion: Suggestion, context: string) {
    this.setSuggestion(suggestion);
    this.setContext(context);
  }

  getSuggestion(): Suggestion {
    return this.suggestion;
  }

  getContext(): string {
    return this.context;
  }

  setContext(context: string): void {
    this.context = context;
  }

  setSuggestion(suggestion: Suggestion): void {
    this.suggestion = suggestion;
  }
}
