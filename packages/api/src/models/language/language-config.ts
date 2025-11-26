import { AvailableLanguagesList } from './available-languages-list';
import { Model } from '../common';

/**
 * Represents the configuration for language settings in the application.
 */
export class LanguageConfig extends Model<LanguageConfig>  {
  defaultLanguage: string;
  availableLanguages: AvailableLanguagesList;

  constructor(data: Partial<LanguageConfig>) {
    super();
    this.defaultLanguage = data.defaultLanguage ?? '';
    this.availableLanguages = data.availableLanguages!;
  }
}
