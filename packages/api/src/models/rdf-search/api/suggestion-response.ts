import {SuggestionType} from '../suggestion-type';

export interface SuggestionResponse {
  /** The type of the suggestion. */
  type: SuggestionType;

  /** The value of the suggestion. */
  value: string;

  /** A description of the suggestion. */
  description?: string;

  // internal
  /** Unique identifier for the suggestion. */
  id?: number;
}

export interface SuggestionInit {
  id?: number;
  type: SuggestionType;
  value: string;
  description?: string;
}
