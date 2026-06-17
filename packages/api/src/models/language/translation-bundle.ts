export type TranslationBundle = {
  language: string | undefined;
  [key: string]: string | TranslationBundle | undefined;
}
