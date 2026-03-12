import {TranslationBundle} from '../../../models/language';
import {ScrollLocation} from '../../../models/interactive-guide';

/**
 * Bridge interface between the guide step plugins and the application services.
 * Provides the API that steps can use to interact with the application.
 */
export interface GuideStepBridge {
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
  translate(bundle: TranslationBundle | undefined, key: string | Record<string, string>, parameters?: Record<string, string>): string;

  /**
   * Decodes HTML entities in the translated string safely using DOMParser,
   * preventing XSS when the result is appended to the DOM.
   *
   * @param html - The string to sanitize.
   * @returns The decoded plain-text string.
   */
  sanitize(html: string): string;

  /**
   * Replaces placeholders in the translation string with the given parameters.
   * Example: 'Hello {{name}}' + { name: 'Alice' } → 'Hello Alice'
   *
   * @param translation - The translation string with placeholders.
   * @param parameters - The parameters to replace.
   * @returns The translation with parameters applied.
   */
  applyParameters(translation: string, parameters?: Record<string, string>): string;

  /**
   * Waits for an element matching the selector to be present (and optionally visible) in the DOM.
   *
   * @param elementSelector - CSS selector or a function returning a CSS selector.
   * @param timeoutInSeconds - Maximum time to wait in seconds. Defaults to 1.
   * @param checkVisibility - If true, waits until the element is also visible. Defaults to true.
   * @returns A promise that resolves with the found element.
   */
  waitFor(elementSelector: string | (() => string), timeoutInSeconds?: number, checkVisibility?: boolean): Promise<Element>;

  /**
   * Returns the element immediately if it already exists (and is optionally visible),
   * otherwise falls back to {@link waitFor}.
   *
   * @param elementSelector - CSS selector or a function returning a CSS selector.
   * @param timeoutInSeconds - Maximum time to wait in seconds. Defaults to 1.
   * @param checkVisibility - If true, checks/waits for visibility. Defaults to true.
   * @returns A promise that resolves with the found element.
   */
  getOrWaitFor(elementSelector: string | (() => string), timeoutInSeconds?: number, checkVisibility?: boolean): Promise<Element>;

  /**
   * Scrolls the window to the given vertical offset with smooth behaviour.
   * Accepts a numeric pixel value or one of the preset string offsets: `'start'` (top of the page)
   * or `'center'` (vertical centre of the viewport).
   *
   * @param offsetTop - A pixel value or a preset string (`'start'` | `'center'`).
   */
  scrollToOffset(offsetTop: ScrollLocation | number): void;
}

