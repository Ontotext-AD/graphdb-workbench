import {Service} from '../../providers/service/service';
import {TranslationBundle} from '../../models/language';
import {MapperProvider, ServiceProvider} from '../../providers';
import {LanguageConfig} from '../../models/language';
import {LanguageRestService} from './language-rest.service';
import {LanguageConfigMapper} from './mappers/language-config-mapper';
import {LanguageContextService} from './language-context.service';

/**
 * The LanguageService class is responsible for fetching language-related data from the backend
 * and mapping the responses to the workbench models.
 */
export class LanguageService implements Service {
  private readonly languageRestService: LanguageRestService = ServiceProvider.get(LanguageRestService);
  private readonly languageContextService: LanguageContextService = ServiceProvider.get(LanguageContextService);

  /**
   * Retrieves an array of supported language codes.
   *
   * This function fetches the language configuration from the storage service
   * and extracts the list of supported language codes. If no configuration
   * is found, it returns a default array with 'en' and 'fr'.
   *
   * @returns {string[]} An array of supported language codes.
   */
  getSupportedLanguages(): string[] {
    const languageConfig = this.languageContextService.getLanguageConfig();
    return languageConfig ? languageConfig.availableLanguages.getLanguageCodes() : ['en', 'fr'];
  }

  /**
   * Retrieves the translation bundle for a specified language.
   *
   * @param {string} languageCode - The code of the language for which to fetch the translation bundle.
   * @returns {Promise<TranslationBundle>} A promise that resolves to a TranslationBundle object
   * containing the translations for the specified language.
   */
  getLanguage(languageCode: string): Promise<TranslationBundle> {
    return this.languageRestService.getLanguage(languageCode);
  }

  /**
   * Retrieves the language configuration from the server and maps it to a LanguageConfig model.
   *
   * @returns {Promise<LanguageConfig>} A promise that resolves to a LanguageConfig object
   * representing the current language configuration.
   */
  getLanguageConfiguration(): Promise<LanguageConfig> {
    return this.languageRestService.getLanguageConfiguration()
      .then(config => MapperProvider.get(LanguageConfigMapper).mapToModel(config));
  }

  /**
   * Retrieves the default language code from the stored language configuration.
   *
   * This function attempts to fetch the language configuration from the storage service
   * and extract the default language code. If no configuration is found, it returns 'en'
   * (English) as the default language.
   *
   * @returns {string} The default language code. Returns 'en' if no configuration is found.
   */
  getDefaultLanguage(): string {
    const languageConfig = this.languageContextService.getLanguageConfig();
    return languageConfig ? languageConfig.defaultLanguage : 'en';
  }
}
