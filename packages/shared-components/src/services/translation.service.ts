import {ServiceProvider, LanguageContextService, TranslationBundle} from "@ontotext/workbench-api";
import {TranslationParameter} from '../models/translation/translation-parameter';
import {TranslationCallback, TranslationObserver} from '../models/translation/translation-observer';
import {sanitizeHTML} from '../utils/html-utils';

/**
 * Service responsible for translation operations in the component.
 */
class TranslationServiceClassDefinition {

  private currentBundle: TranslationBundle;
  private readonly defaultBundle?: TranslationBundle;

  private readonly languageContextService: LanguageContextService = ServiceProvider.get(LanguageContextService);
  private languageChangeSubscription: () => void;
  private translationChangedObservers: Record<string, TranslationObserver[]> = {};

  constructor() {
    // log with background color
    this.defaultBundle = this.languageContextService.getDefaultBundle();
    this.subscribeToBundleChange();
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
    return this.translateInLocale(key, parameters);
  }

  /**
   * Translates a given key into the specified locale. If parameters are provided,
   * they will be applied to the translation.
   *
   * @param key - The translation key, which can be dot-separated for nested translations.
   * @param parameters - Optional parameters to be substituted into the translation string.
   * @returns The translated string with parameters applied if available, or the key itself if not found.
   */
  public translateInLocale(key: string, parameters?: TranslationParameter[]): string {
    // Attempt to retrieve the translation from the specified locale's bundle.
    let translation = this.translateFromBundle(this.currentBundle, key);

    // If not found, fall back to the default language bundle.
    if (!translation) {
      translation = this.translateFromBundle(this.defaultBundle, key);
    }

    // If translation was found, apply any parameters provided and return the result.
    if (translation) {
      translation = this.applyParameters(translation, parameters);
      return sanitizeHTML(translation);
    }

    console.warn(`Missing translation for key: [${key}]`);
    return key;
  }

  /**
   * Retrieves a translation from a specified translation bundle using the given key.
   * If the key represents a nested JSON path, it attempts to resolve the key as such.
   *
   * @param bundle - The translation bundle for the specified locale.
   * @param key - The key to translate, which may be a simple key or dot-separated for nested keys.
   * @returns The translation string if found, or `undefined` if not available.
   */
  private translateFromBundle(bundle: TranslationBundle, key: string): string | undefined {
    if (!bundle) {
      return undefined;
    }
    // Try to retrieve the translation directly if it is defined as a whole string,
    // for instance as "some_function.btn.label".
    let translation = bundle[key];

    // If not found, attempt to retrieve the translation if it is defined as a JSON object.
    if (typeof translation !== 'string') {
      translation = this.translateAsJsonObject(bundle, key);
    }
    return translation;
  }

  /**
   * Resolves a nested translation key by treating it as a path in a JSON object.
   * For example, if the key is "some.key.path", this method will navigate through
   * the JSON object structure to retrieve the value at that path.
   *
   * @param bundle - The translation bundle containing nested keys.
   * @param key - The dot-separated key representing the path to the translation.
   * @returns The translation string if found, or `undefined` if the path does not exist.
   */
  private translateAsJsonObject(bundle: TranslationBundle, key: string): string {
    let path = key.split('.');
    return this.getTranslation(bundle, path);
  }

  /**
   * Recursively navigates through a JSON object based on a path array to retrieve
   * a translation string. Each element in the path array represents a nested key.
   *
   * @param jsonObject - The current JSON object or nested object being searched.
   * @param path - An array representing the path to the translation, where each element is a key.
   * @returns The translation string if found, or `undefined` if the path does not exist.
   */
  private getTranslation(jsonObject: TranslationBundle, path: string[]) {
    // Stop the recursion if path or reach the inner element
    if (!path || !jsonObject) {
      return undefined;
    }

    const jsonOrTranslation = jsonObject[path.splice(0, 1)[0]];

    if (path.length === 0) {
      return jsonOrTranslation;
    }

    if (typeof jsonOrTranslation !== 'string') {
      // continue if the inner element is not reached.
      if (path.length > 0) {
        return this.getTranslation(jsonOrTranslation, path);
      }
      return jsonOrTranslation;
    }
    return undefined;
  }

  private applyParameters(translation: string, parameters: TranslationParameter[]): string {
    if (parameters) {
      return parameters.reduce(
        // replace all occurrence of parameter key with parameter value.
        (translation, parameter) => TranslationServiceClassDefinition.replaceAll(translation, parameter),
        translation);
    }
    return translation;
  }

  private static replaceAll(translation: string, parameter: TranslationParameter): string {
    return parameter ? translation.split(`{{${parameter.key}}}`).join(parameter.value) : translation;
  }

  private notifyTranslationsChanged(): void {
    Object.keys(this.translationChangedObservers).forEach((eventName) => {
      const observers = this.translationChangedObservers[eventName] || [];
      observers.forEach((observer) => observer.callback(this.translate(eventName, observer.parameters)));
    });
  }

  private subscribeToBundleChange() {
    this.languageChangeSubscription = this.languageContextService.onLanguageBundleChanged((bundle) => {
      if (bundle) {
        this.currentBundle = bundle;
        this.notifyTranslationsChanged();
      }
    });
  }

  destroy(): void {
    if (this.languageChangeSubscription) {
      this.languageChangeSubscription();
    }
  }
}

export const TranslationService = new TranslationServiceClassDefinition();
