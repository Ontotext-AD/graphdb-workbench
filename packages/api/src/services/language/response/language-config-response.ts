export interface LanguageConfigResponse {
  defaultLanguage: string;
  availableLanguages: AvailableLanguageResponse[];
}

export type AvailableLanguageResponse = {
  key: string;
  name: string;
}
