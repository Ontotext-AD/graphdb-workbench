import { HttpService } from '../http/http.service';
import { LanguageConfig, TranslationBundle } from '../../models/language';

/**
 * Service for handling language-related REST operations.
 */
export class LanguageRestService extends HttpService {
  /**
   * Retrieves the translation bundle for a specific language.
   *
   * @param languageCode - The code of the language for which to fetch translations.
   * @returns A Promise that resolves to a TranslationBundle containing the translations for the specified language.
   */
  getLanguage(languageCode: string): Promise<TranslationBundle> {
    return this.get<TranslationBundle>(`/onto-i18n/${languageCode}.json`);
  }

  /**
   * Fetches the language configuration for the application.
   *
   * @returns A Promise that resolves to a {@link LanguageConfig} object containing the language configuration settings.
   */
  getLanguageConfiguration(): Promise<LanguageConfig> {
    return this.get<LanguageConfig>('/onto-i18n/language-config.json');
  }
}
