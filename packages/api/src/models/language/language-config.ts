import {AvailableLanguagesList} from './available-languages-list';
import {Model} from '../common';

export const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = ['en', 'fr'];

/**
 * Represents the configuration for language settings in the application.
 */
export class LanguageConfig extends Model<LanguageConfig> {
  readonly defaultLanguage: string;
  readonly availableLanguages: AvailableLanguagesList;

  constructor(props: Partial<LanguageConfig>) {
    super();
    this.defaultLanguage = props.defaultLanguage || DEFAULT_LANGUAGE;
    this.availableLanguages = props.availableLanguages || new AvailableLanguagesList();
  }
}
