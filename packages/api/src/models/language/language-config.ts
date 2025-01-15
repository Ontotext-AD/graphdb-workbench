import { AvailableLanguagesList } from './available-languages-list';
import { Model } from '../common';
import { MapperProvider } from '../../providers';
import { AvailableLanguagesListMapper } from '../../services/language/mappers/available-languages-list-mapper';

/**
 * Represents the configuration for language settings in the application.
 */
export class LanguageConfig extends Model<LanguageConfig>  {
  defaultLanguage: string;

  availableLanguages: AvailableLanguagesList;

  constructor(data: LanguageConfig) {
    super();
    this.defaultLanguage = data.defaultLanguage;
    this.availableLanguages = MapperProvider.get(AvailableLanguagesListMapper).mapToModel(data.availableLanguages);
  }
}
