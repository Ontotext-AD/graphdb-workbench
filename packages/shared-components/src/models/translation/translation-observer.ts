import {TranslationParameter} from './translation-parameter';

export type TranslationCallback = (translation: string) => void;

export interface TranslationObserver {
  parameters: TranslationParameter[];
  callback: TranslationCallback;
}
