import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {LanguageContextService} from '../../language';
import {TranslationBundle} from '../../../models/language';
import {LoggerProvider} from '../../logging/logger-provider';
import {GuideStepBridge} from './guide-step-bridge';
import {WindowService} from '../../window';

/**
 * The bridge API between the guide step plugins and the application services.
 * This class implements {@link GuideStepBridge} and provides the concrete implementations
 * of the methods that steps can use to interact with the application.
 *
 * It will incrementally absorb more service capabilities (e.g. scroll, navigation)
 * as the migration from the legacy ShepherdService progresses.
 */
export class GuideApi implements Service, GuideStepBridge {
  private readonly logger = LoggerProvider.logger;
  private readonly languageContextService = service(LanguageContextService);

  /**
   * Translates a key from the given translation bundle, falling back to the default bundle if the
   * key is not found in the current bundle. A bundle object can also be passed directly as the key,
   * in which case the translation will be resolved from it using the current language, falling back to
   * the default language.
   *
   * @param bundle - The translation bundle for the current locale.
   * @param key - The translation key to look up.
   * @param parameters - Optional parameters to interpolate into the translation string.
   * @returns The translated string, or the key itself if no translation is found.
   */
  translate(bundle: TranslationBundle | undefined, key: string | TranslationBundle, parameters: Record<string, string> = {}): string {
    // If key is a per-language object (e.g. { en: '...', fr: '...' }), resolve the translation
    // directly from it using the current language, falling back to English.
    if (key && typeof key === 'object') {
      const lang = this.languageContextService.getSelectedLanguage() ?? this.languageContextService.getDefaultLanguage();
      const translation = key[lang];
      if (!translation) {
        this.logger.warn(`Missing translation for language [${lang}] in message object`);
        return '';
      }
      return this.sanitize(this.applyParameters(translation as string, parameters));
    }

    bundle ??= this.languageContextService.getLanguageBundle();
    let translation = bundle?.[key];

    if (!translation) {
      bundle = this.languageContextService.getDefaultBundle();
      translation = bundle?.[key];
    }

    if (!translation) {
      this.logger.warn(`Missing translation for [${key}] key`);
      return key;
    }

    return this.sanitize(this.applyParameters(translation as string, parameters));
  }

  /**
   * Decodes HTML entities in the translated string safely using DOMParser,
   * preventing XSS when the result is appended to the DOM.
   *
   * @param html - The string to sanitize.
   * @returns The decoded plain-text string.
   */
  sanitize(html: string): string {
    return new DOMParser().parseFromString(html, 'text/html').body.innerText;
  }

  /**
   * Replaces placeholders in the translation string with the given parameters.
   * Example: 'Hello {{name}}' + { name: 'Alice' } → 'Hello Alice'
   *
   * @param translation - The translation string with placeholders.
   * @param parameters - The parameters to replace.
   * @returns The translation with parameters applied.
   */
  applyParameters(translation: string, parameters: Record<string, string>): string {
    return Object.entries(parameters).reduce(
      (result, [paramKey, paramValue]) => this.replaceAll(result, paramKey, paramValue),
      translation,
    );
  }

  replaceAll(translation: string, key: string, value: string): string {
    return translation.split(`{{${key}}}`).join(value);
  };

  /**
   * Waits for an element matching the selector to be present (and optionally visible) in the DOM.
   *
   * @param elementSelector - CSS selector or a function returning a CSS selector.
   * @param timeoutInSeconds - Maximum time to wait in seconds. Defaults to 1.
   * @param checkVisibility - If true, waits until the element is also visible. Defaults to true.
   * @returns A promise that resolves with the found element.
   */
  waitFor(elementSelector: string | (() => string), timeoutInSeconds = 1, checkVisibility = true): Promise<Element> {
    const selector = this.resolveSelector(elementSelector);
    return new Promise((resolve, reject) => {
      let remaining = timeoutInSeconds * 1000;
      const waitTime = 100;
      const interval = setInterval(() => {
        try {
          const element = document.querySelector(selector);
          if (element) {
            if (!checkVisibility || this.isElementVisible(element)) {
              clearInterval(interval);
              resolve(element);
            } else {
              remaining -= waitTime;
              if (remaining < 0) {
                clearInterval(interval);
                this.logger.warn('Element is not visible: ' + selector);
                reject(new Error('Element is not visible: ' + selector));
              }
            }
          } else {
            remaining -= waitTime;
            if (remaining < 0) {
              clearInterval(interval);
              this.logger.warn('Element is not found: ' + selector);
              reject(new Error('Element is not found: ' + selector));
            }
          }
        } catch (error) {
          clearInterval(interval);
          this.logger.error('Error when processing selector: ' + selector);
          this.logger.error(String(error));
          reject(error);
        }
      }, waitTime);
    });
  }

  /**
   * Returns the element immediately if it already exists (and is optionally visible),
   * otherwise falls back to {@link waitFor}.
   *
   * @param elementSelector - CSS selector or a function returning a CSS selector.
   * @param timeoutInSeconds - Maximum time to wait in seconds. Defaults to 1.
   * @param checkVisibility - If true, checks/waits for visibility. Defaults to true.
   * @returns A promise that resolves with the found element.
   */
  getOrWaitFor(elementSelector: string | (() => string), timeoutInSeconds = 1, checkVisibility = true): Promise<Element> {
    const selector = this.resolveSelector(elementSelector);
    const element = document.querySelector(selector);
    if (element && (!checkVisibility || this.isElementVisible(element))) {
      return Promise.resolve(element);
    }
    return this.waitFor(elementSelector, timeoutInSeconds, checkVisibility);
  }

  /**
   * Resolves the element selector — if it is a function, calls it to get the actual selector string.
   *
   * @param elementSelector - A CSS selector string or a function returning one.
   * @returns The resolved CSS selector string.
   */
  private resolveSelector(elementSelector: string | (() => string)): string {
    return typeof elementSelector === 'function' ? elementSelector() : elementSelector;
  }

  private static readonly SCROLL_OFFSET_MAP: Record<string, number> = {
    start: 0,
    center: WindowService.getWindow().innerHeight / 2,
  };

  /**
   * Scrolls the window to the given vertical offset with smooth behaviour.
   * Accepts a numeric pixel value or one of the preset string offsets: `'start'` (top of the page)
   * or `'center'` (vertical centre of the viewport).
   *
   * @param offsetTop - A pixel value or a preset string (`'start'` | `'center'`).
   */
  scrollToOffset(offsetTop: string | number): void {
    const top = (typeof offsetTop === 'string' ? GuideApi.SCROLL_OFFSET_MAP[offsetTop] : undefined) ?? offsetTop;
    WindowService.getWindow().scrollTo({
      top: top as number,
      behavior: 'smooth',
    });
  }

  /**
   * Checks whether a given DOM element is visible in the document.
   *
   * @param element - The DOM element to check.
   * @returns `true` if the element is visible; otherwise, `false`.
   */
  private isElementVisible(element: Element): boolean {
    const style = WindowService.getWindow().getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return style.display !== 'none'
      && style.visibility !== 'hidden'
      && style.opacity !== '0'
      && rect.width !== 0
      && rect.height !== 0;
  }
}

