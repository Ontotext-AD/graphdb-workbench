import {TranslationBundle} from '../../models/language';
import {HtmlUtil} from './html-util';

export class TranslationUtil {
  /**
   * Resolves, interpolates, and sanitizes a translation from a bundle.
   *
   * @param bundle - The bundle containing the translations.
   * @param key - The translation key.
   * @param parameters - Values used to replace placeholders such as `{{name}}`.
   * @returns The sanitized translation, or `undefined` if it is unavailable.
   */
  static translate(bundle: TranslationBundle | undefined, key: string, parameters: Record<string, string> = {}): string | undefined {
    if (!bundle) {
      return undefined;
    }

    const translation = bundle[key];
    if (typeof translation !== 'string') {
      return undefined;
    }

    return HtmlUtil.sanitize(TranslationUtil.applyParameters(translation, parameters));
  }

  /**
   * Replaces placeholders with the corresponding parameter values.
   *
   * @param translation - The translation containing placeholders.
   * @param parameters - Values mapped to placeholder names.
   * @returns The translation with all matching placeholders replaced.
   */
  static applyParameters(translation: string, parameters: Record<string, string> = {}): string {
    return Object.entries(parameters).reduce((result, [key, value]) => TranslationUtil.replaceAll(result, key, value), translation);
  }

  /**
   * Replaces every occurrence of a placeholder with the provided value.
   *
   * @param translation - The translation containing the placeholder.
   * @param key - The placeholder name without braces.
   * @param value - The replacement value.
   * @returns The translation with every matching placeholder replaced.
   */
  static replaceAll(translation: string, key: string, value: string): string {
    return translation.split(`{{${key}}}`).join(value);
  }
}
