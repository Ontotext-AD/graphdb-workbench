import {Service} from '../service';

/**
 * The LanguageService class is responsible for fetching language-related data from the backend
 * and mapping the responses to the workbench models.
 */
export class LanguageService implements Service {

  static readonly DEFAULT_LANGUAGE = 'en';
  // TODO load this dynamically
  private supportedLanguages = ['en', 'fr'];

  /**
   * Returns an array with supported languages.
   * @returns {string[]} An array of supported language codes.
   */
  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }
}
