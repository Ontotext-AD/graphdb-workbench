import en from '../assets/i18n/en.json'
import fr from '../assets/i18n/fr.json'
import {ServiceProvider, LanguageService} from "@ontotext/workbench-api";
import {Subscription} from '@reactivex/rxjs/dist/package';
import {TranslationParameter} from '../models/translation/translation-parameter';
import {TranslationCallback, TranslationObserver} from '../models/translation/translation-observer';

/**
 * Service responsible for translation operations in the component.
 */
class TranslationServiceClassDefinition {

  private bundle = {en, fr}
  private readonly languageChangeSubscription: Subscription;
  private currentLanguage = LanguageService.DEFAULT_LANGUAGE;

  private translationChangedObservers: Record<string, TranslationObserver[]> = {};

  constructor() {
    this.languageChangeSubscription = ServiceProvider.get(LanguageService).onLanguageChanged().subscribe(((language) => {
      this.currentLanguage = language;
      this.notifyTranslationsChanged();
    }));
  }

  /**
   * Translates the <code>messageLabelKey</code> with <code>translationParameter</code> and call <code>translationCallback</code> with translation of current language.
   * The <code>translationCallback</code> is called upon subscription and whenever the selected language is changed.
   *
   * @param messageLabelKey - The label key for the translation.
   * @param translationParameter - Parameters, if needed, for translation.
   * @param translationCallback - A function to be called when translating the `messageLabelKey`.
   * @returns A function that, when called, unsubscribes the provided callback from further translation updates.
   */
  public onTranslate(messageLabelKey: string, translationParameter: TranslationParameter[] = [], translationCallback: TranslationCallback = () => {/*do nothing*/}) {
    this.translationChangedObservers[messageLabelKey] = this.translationChangedObservers[messageLabelKey] || [];

    const observer: TranslationObserver = {parameters: translationParameter, callback: translationCallback};
    this.translationChangedObservers[messageLabelKey].push(observer);

    translationCallback(this.translate(messageLabelKey, translationParameter));

    return () => {
      const index = this.translationChangedObservers[messageLabelKey].indexOf(observer);
      if (index !== -1) {
        this.translationChangedObservers[messageLabelKey].splice(index, 1);
      }
    };
  }

  /**
   * Translates the provided key using the currently selected language by applying the parameters if
   * provided.
   * @param key The key for the label which needs to be translated.
   * @param parameters Optional parameters which to be applied during the translation.
   */
  public translate(key: string, parameters?: TranslationParameter[]): string {
    return this.translateInLocale(key, this.currentLanguage, parameters);
  }

  public translateInLocale(key: string, locale: string, parameters?: TranslationParameter[]): string {
    let translation = this.bundle[locale][key];
    if (!translation) {
      // Fallback to the default language
      translation = this.bundle[LanguageService.DEFAULT_LANGUAGE][key];
    }

    if (translation) {
      translation = this.applyParameters(translation, parameters);
      return translation;
    }

    console.warn(`Missing translation for [${key}] key in [${this.currentLanguage}] locale`);
    return key;
  }

  private applyParameters(translation: string, parameters: TranslationParameter[]): string {
    if (parameters !== null) {
      return parameters.reduce(
        // replace all occurrence of parameter key with parameter value.
        (translation, parameter) => TranslationServiceClassDefinition.replaceAll(translation, parameter),
        translation);
    }
    return translation;
  }

  private static replaceAll(translation: string, parameter: TranslationParameter | null | undefined): string {
    return parameter != null
      ? translation.split(`{{${parameter.key}}}`).join(parameter.value)
      : translation;
  }


  private notifyTranslationsChanged(): void {
    Object.keys(this.translationChangedObservers).forEach((eventName) => {
      const observers = this.translationChangedObservers[eventName] || [];
      observers.forEach((observer) => observer.callback(this.translate(eventName, observer.parameters)));
    });
  }

  destroy(): void {
    if (this.languageChangeSubscription != null) {
      this.languageChangeSubscription.unsubscribe();
    }
  }
}

export const TranslationService = new TranslationServiceClassDefinition();
