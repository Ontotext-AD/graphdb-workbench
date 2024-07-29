import {TranslationParameter} from './translation-parameter';

/**
 * A callback function which is called when the translation is ready.
 */
export type TranslationCallback = (translation: string) => void;

/**
 * A shape of the observer which is used to subscribe to translation changes.
 */
export interface TranslationObserver {
  parameters: TranslationParameter[];
  callback: TranslationCallback;
}
