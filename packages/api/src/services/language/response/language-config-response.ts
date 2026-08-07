export interface LanguageConfigResponse {
  languageBundleVersion: string;
  defaultLanguage: string;
  availableLanguages: AvailableLanguageResponse[];
}

export type AvailableLanguageResponse = {
  key: string;
  name: string;
}
