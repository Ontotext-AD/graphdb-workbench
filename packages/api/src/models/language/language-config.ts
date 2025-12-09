import { AvailableLanguagesList } from './available-languages-list';
import { Model } from '../common';
import {mapAvailableLanguagesListToModel} from '../../services/language/mappers/available-languages-list-mapper';
import {AvailableLanguage} from './available-language';

/**
 * Represents the configuration for language settings in the application.
 */
export class LanguageConfig extends Model<LanguageConfig>  {
  defaultLanguage: string;

  availableLanguages: AvailableLanguagesList;

  constructor(data: LanguageConfig) {
    super();
    this.defaultLanguage = data.defaultLanguage;
    this.availableLanguages = mapAvailableLanguagesListToModel(data.availableLanguages as unknown as AvailableLanguage[]);
  }
}
