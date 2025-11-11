export type TranslationBundle = {
  language: string;
  [key: string]: string | TranslationBundle;
}
