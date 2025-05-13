import {ContextService} from '../context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {ServiceProvider} from '../../providers';
import {LanguageStorageService} from './language-storage.service';
import {LanguageService} from './language.service';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {LanguageConfig, TranslationBundle} from '../../models/language';
import {BeforeChangeValidationPromise} from '../../models/context/before-change-validation-promise';

type LanguageContextFields = {
  readonly SELECTED_LANGUAGE: string;
}

/**
 * The LanguageService class manages the application's language context.
 */
export class LanguageContextService extends ContextService<LanguageContextFields> implements DeriveContextServiceContract<LanguageContextFields> {
  private readonly LANGUAGE_CONFIG = 'languageConfig';
  readonly SELECTED_LANGUAGE = 'selectedLanguage';
  readonly LANGUAGE_BUNDLE = 'languageBundle';
  readonly DEFAULT_BUNDLE = 'defaultBundle';

  /**
   * Changes the selected language of the application. This method updates the selected language and notifies
   * all subscribers about the language change.
   *
   * @param {string} locale - The new language code to set (e.g., 'en', 'fr', 'de').
   */
  updateSelectedLanguage(locale?: string): void {
    this.validatePropertyChange(this.SELECTED_LANGUAGE, locale)
      .then((shouldSet) => {
        if (shouldSet) {
          const selectedLanguage = locale || ServiceProvider.get(LanguageService).getDefaultLanguage();
          const storageService = ServiceProvider.get(LanguageStorageService);
          storageService.set(this.SELECTED_LANGUAGE, selectedLanguage);
          this.updateContextProperty(this.SELECTED_LANGUAGE, locale);
        }
      });
  }

  /**
   * Registers a <code>callbackFunction</code> to be called whenever the selected language changes.
   *
   * This method allows components to react to language changes in the application.
   * The callback will be triggered with the new language value whenever it changes.
   *
   * @param callbackFunction - The function to call when the selected language changes.
   * @param beforeChangeValidationPromise - Optional. A promise that will be resolved before
   *        the language change is applied. This can be used to validate or prepare for the
   *        language change. If the promise is resolved with false or rejects, the language change will be canceled.
   * @returns A function to unsubscribe from updates.
   */
  onSelectedLanguageChanged(callbackFunction: ValueChangeCallback<string | undefined>, beforeChangeValidationPromise?: BeforeChangeValidationPromise<string | undefined>): () => void {
    return this.subscribe(this.SELECTED_LANGUAGE, callbackFunction, beforeChangeValidationPromise);
  }

  /**
   * Updates the language bundle in the context.
   *
   * This method is responsible for updating the translation bundle used for
   * internationalization in the application. It updates the context property
   * associated with the language bundle.
   *
   * @param {TranslationBundle} bundle - The new translation bundle to be set.
   */
  updateLanguageBundle(bundle: TranslationBundle): void {
    this.updateContextProperty<TranslationBundle>(this.LANGUAGE_BUNDLE, bundle);
  }

  /**
   * Registers a callback function to be called whenever the language bundle changes.
   *
   * @param {ValueChangeCallback<TranslationBundle | undefined>} callbackFunction - The function to call when the language bundle changes.
   *        This function will receive the new TranslationBundle as its parameter, or undefined if the bundle is cleared.
   */
  onLanguageBundleChanged(callbackFunction: ValueChangeCallback<TranslationBundle | undefined>): () => void {
    return this.subscribe(this.LANGUAGE_BUNDLE, callbackFunction);
  }

  /**
   * Updates the default language bundle in the context.
   *
   * This method sets a new default translation bundle for the application.
   * It's typically used to store a fallback bundle that can be used when
   * the primary language bundle is not available or incomplete.
   *
   * @param {TranslationBundle} bundle - The new default translation bundle to be set.
   */
  updateDefaultBundle(bundle: TranslationBundle): void {
    this.updateContextProperty<TranslationBundle>(this.DEFAULT_BUNDLE, bundle);
  }

  /**
   * Retrieves the current default language bundle from the context.
   *
   * This method returns the default translation bundle that was previously
   * set using the updateDefaultBundle method. If no default bundle has been
   * set, it returns undefined.
   *
   * @returns {TranslationBundle | undefined} The current default translation bundle,
   *          or undefined if no default bundle has been set.
   */
  getDefaultBundle(): TranslationBundle | undefined {
    return this.getContextPropertyValue(this.DEFAULT_BUNDLE);
  }

  /**
   * Retrieves the current language configuration from the context.
   *
   * @returns {LanguageConfig | undefined} The current language configuration,
   *          or undefined if no configuration has been set.
   */
  getLanguageConfig(): LanguageConfig | undefined {
    return this.getContextPropertyValue(this.LANGUAGE_CONFIG);
  }

  /**
   * Sets a new language configuration in the context.
   *
   * @param {LanguageConfig} languageConfig - The new language configuration to be set.
   */
  setLanguageConfig(languageConfig?: LanguageConfig) {
    this.updateContextProperty(this.LANGUAGE_CONFIG, languageConfig);
  }

  /**
   * Retrieves the currently selected language from the context.
   *
   * @returns {string | undefined} The code of the currently selected language.
   *          Returns undefined if no language has been selected or set in the context.
   *
   */
  getSelectedLanguage(): string | undefined {
    return this.getContextPropertyValue(this.SELECTED_LANGUAGE);
  }
}
