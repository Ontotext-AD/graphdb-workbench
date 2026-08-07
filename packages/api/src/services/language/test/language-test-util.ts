import {AvailableLanguageResponse, LanguageConfigResponse} from '../response/language-config-response';
import {AvailableLanguage} from '../../../models/language/available-language';
import {AvailableLanguagesList, LanguageConfig} from '../../../models/language';

const languageConfigResponse: LanguageConfigResponse = {
  defaultLanguage: 'en',
  languageBundleVersion: '1',
  availableLanguages: [
    {key: 'de', name: 'German'},
    {key: 'es', name: 'Spanish'}
  ]
};

export const createlanguageConfig = (customResponse?: LanguageConfigResponse) => {
  const response = customResponse || languageConfigResponse;
  const availableLanguageList = response.availableLanguages.map((lang: AvailableLanguageResponse) => {
    return new AvailableLanguage(lang.key, lang.name);
  });
  return new LanguageConfig({
    defaultLanguage: response.defaultLanguage,
    availableLanguages: new AvailableLanguagesList(availableLanguageList),
    languageBundleVersion: response.languageBundleVersion
  });
};
