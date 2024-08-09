import {Service} from './service';
import {ReplaySubject, Subject} from '@reactivex/rxjs/dist/package';

/**
 * The LanguageService class manages the application's language settings.
 */
export class LanguageService implements Service {

  static readonly DEFAULT_LANGUAGE = 'en';
  // TODO load this dynamically
  private supportedLanguages = ['en', 'fr'];
  private readonly selectedLanguage = new ReplaySubject<string>(1);

  /**
     * Constructs a new LanguageService instance.
     * Reads the initial language setting from local storage (not yet implemented)
     * and sets it as the first value of the ReplaySubject.
     */
  constructor() {
    // TODO read it from local store and pass it as first value
    this.changeLanguage(LanguageService.DEFAULT_LANGUAGE);
  }

  /**
     * Returns an array with supported languages.
     * @returns {string[]} An array of supported language codes.
     */
  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  /**
     * Changes the current language of the application.
     * This method updates the language setting and notifies all subscribers
     * about the language change. The new language is also intended to be saved
     * to local storage (not yet implemented).
     *
     * @param {string} locale - The new language code to set (e.g., 'en', 'fr', 'de').
     */
  changeLanguage(locale: string): void {
    // TODO save it to local store.
    this.selectedLanguage.next(locale);
  }

  /**
     * Returns an observable that emits the current language whenever it changes.
     * Subscribers to this observable will receive updates whenever the language
     * is changed using the `changeLanguage` method.
     *
     * @returns {Subject<string>} An observable stream of language changes.
     */
  onLanguageChanged(): Subject<string> {
    return this.selectedLanguage;
  }
}
