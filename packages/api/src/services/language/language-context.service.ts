import {ContextService} from '../context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {ServiceProvider} from '../../providers';
import {LanguageStorageService} from './language-storage.service';
import {LanguageService} from './language.service';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';

type LanguageContextFields = {
  readonly SELECTED_LANGUAGE: string;
}

/**
 * The LanguageService class manages the application's language context.
 */
export class LanguageContextService extends ContextService<LanguageContextFields> implements DeriveContextServiceContract<LanguageContextFields> {
  readonly SELECTED_LANGUAGE = 'selectedLanguage';

  /**
   * Changes the selected language of the application. This method updates the selected language and notifies
   * all subscribers about the language change.
   *
   * @param {string} locale - The new language code to set (e.g., 'en', 'fr', 'de').
   */
  updateSelectedLanguage(locale: string | undefined): void {
    const selectedLanguage = locale || LanguageService.DEFAULT_LANGUAGE;
    const storageService = ServiceProvider.get(LanguageStorageService);
    storageService.set(this.SELECTED_LANGUAGE, selectedLanguage);
    this.updateContextProperty(this.SELECTED_LANGUAGE, locale);
  }

  /**
   *
   * Registers the <code>callbackFunction</code> to be called whenever the selected language changes.
   *
   * @param callbackFunction - The function to call when the selected language changes.
   * @returns A function to unsubscribe from updates.
   */
  onSelectedLanguageChanged(callbackFunction: ValueChangeCallback<string | undefined>): () => void {
    return this.subscribe(this.SELECTED_LANGUAGE, callbackFunction);
  }
}
