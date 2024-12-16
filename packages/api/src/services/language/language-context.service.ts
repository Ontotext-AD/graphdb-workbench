import {ContextService} from '../context/context.service';
import {ValueChangeCallback} from '../../models/context/value-change-callback';

/**
 * The LanguageService class manages the application's language context.
 */
export class LanguageContextService extends ContextService {

  private static readonly SELECTED_LANGUAGE = 'selectedLanguage';

  /**
   * Changes the selected language of the application. This method updates the selected language and notifies
   * all subscribers about the language change.
   *
   * @param {string} locale - The new language code to set (e.g., 'en', 'fr', 'de').
   */
  updateSelectedLanguage(locale: string | undefined): void {
    // TODO save it to local store.
    this.updateContextProperty(LanguageContextService.SELECTED_LANGUAGE, locale);
  }

  /**
   *
   * Registers the <code>callbackFunction</code> to be called whenever the selected language changes.
   *
   * @param callbackFunction - The function to call when the selected language changes.
   * @returns A function to unsubscribe from updates.
   */
  onSelectedLanguageChanged(callbackFunction: ValueChangeCallback<string | undefined>): () => void {
    return this.subscribe(LanguageContextService.SELECTED_LANGUAGE, callbackFunction);
  }
}
