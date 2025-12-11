export interface SuggestionResponse {
  /** The type of the suggestion. */
  type: string;

  /** The value of the suggestion. */
  value: string;

  /** A description of the suggestion. */
  description?: string;
}
