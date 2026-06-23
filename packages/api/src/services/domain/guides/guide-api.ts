import {Service} from '../../../providers/service/service';
import {service} from '../../../providers';
import {LanguageContextService} from '../../language';
import {TranslationBundle} from '../../../models/language';
import {LoggerProvider} from '../../logging/logger-provider';
import {GuideStepBridge} from './guide-step-bridge';
import {WindowService} from '../../window';
import {ScrollLocation} from '../../../models/interactive-guide/scroll-location';
import {getCurrentRoute, HtmlUtil, navigate, UriUtil} from '../../utils';
import {ProductInfoContextService} from '../product-info';

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
  private readonly productInfoContextService = service(ProductInfoContextService);

  // These fields are injected by the active micro-frontend (Angular or AngularJS) at runtime.
  // They cannot be typed here because the API package has no dependency on either framework.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  GuideUtils: any;
  YasguiComponentUtil: any;
  toastr: any;
  ShepherdService: any;
  GuidesService: any;
  EventEmitterService: any;

  $repositories: any;
  $translate: any;
  $interpolate: any;
  $rootScope: any;
  $route: any;
  $timeout: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  RoutingUtil = this.getRoutingUtil();
  resolveDocumentationUrl = this._resolveDocumentationUrl.bind(this);
  translate = this._translate.bind(this);

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
  _translate(bundle: TranslationBundle | undefined, key: string | Record<string, string>, parameters: Record<string, string> = {}): string {
    const currentLanguage = this.languageContextService.getSelectedLanguage() ?? this.languageContextService.getDefaultLanguage();

    if (typeof key === 'object') {
      const translation = key[currentLanguage] ?? key[this.languageContextService.getDefaultLanguage()];
      if (translation) {
        return HtmlUtil.sanitize(this.applyParameters(translation, parameters));
      }
      this.logger.warn(`Missing translation for language [${currentLanguage}] in message object`);
      return '';
    }

    let languageBundle: TranslationBundle | undefined;
    if (bundle) {
      const byLanguage = bundle[currentLanguage];
      languageBundle = (typeof byLanguage === 'object' ? byLanguage : undefined) ?? bundle;
    } else {
      languageBundle = this.languageContextService.getLanguageBundle() ?? this.languageContextService.getDefaultBundle();
    }

    if (!languageBundle) {
      this.logger.warn('Translation bundle is not provided for translation key: ' + JSON.stringify(key));
      return key?.toString() ?? '';
    }

    let translation = languageBundle[key];
    if (!translation && bundle) {
      // Fallback to the language service bundle when the provided bundle does not contain the key
      translation = (this.languageContextService.getLanguageBundle() ?? this.languageContextService.getDefaultBundle())?.[key];
    }

    if (translation) {
      return HtmlUtil.sanitize(this.applyParameters(translation as string, parameters));
    }

    this.logger.warn(`Missing translation for [${key}] key`);
    return key?.toString();
  }

  private _resolveDocumentationUrl(endpoint: string): string {
    const productInfo = this.productInfoContextService.getProductInfo();
    return UriUtil.resolveDocumentationUrl(productInfo?.shortVersion, endpoint);
  };

  private getRoutingUtil() {
    return {
      navigate,
      getCurrentRoute
    };
  }

  /**
   * Replaces placeholders in the translation string with the given parameters.
   * Example: 'Hello {{name}}' + { name: 'Alice' } → 'Hello Alice'
   *
   * @param translation - The translation string with placeholders.
   * @param parameters - The parameters to replace.
   * @returns The translation with parameters applied.
   */
  applyParameters(translation: string, parameters: Record<string, string> = {}): string {
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
   * Scrolls the window to the given vertical offset with smooth behaviour.
   * Accepts a numeric pixel value or one of the preset string offsets: `'start'` (top of the page)
   * or `'center'` (vertical centre of the viewport).
   *
   * @param offsetTop - A pixel value or a preset string (`'start'` | `'center'`).
   */
  scrollToOffset(offsetTop: ScrollLocation | number): void {
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
}

