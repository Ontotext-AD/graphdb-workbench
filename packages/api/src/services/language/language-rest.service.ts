import {HttpService} from '../http/http.service';
import {TranslationBundle} from '../../models/language';
import {LanguageConfigResponse} from './response/language-config-response';

/**
 * Service for handling language-related REST operations.
 */
export class LanguageRestService extends HttpService {
  private readonly I18N_ENDPOINT = 'assets/i18n';

  /**
   * Retrieves the translation bundle for a specific language.
   *
   * @param languageCode - The code of the language for which to fetch translations.
   * @returns A Promise that resolves to a TranslationBundle containing the translations for the specified language.
   */
  getLanguage(languageCode: string): Promise<TranslationBundle> {
    return this.get<TranslationBundle>(`${this.I18N_ENDPOINT}/${languageCode}.json`);
  }

  /**
   * Fetches the language configuration for the application.
   *
   * @returns A Promise that resolves to a {@link LanguageConfigResponse} object containing the language configuration settings.
   */
  getLanguageConfiguration(): Promise<LanguageConfigResponse> {
    return this.get<LanguageConfigResponse>(`${this.I18N_ENDPOINT}/language-config.json`);
  }
}
