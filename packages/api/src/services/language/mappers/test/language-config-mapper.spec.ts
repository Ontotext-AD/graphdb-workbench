import {LanguageConfigResponse, LanguageConfigMapper} from '../language-config-mapper';
import {AvailableLanguagesList, LanguageConfig} from '../../../../models/language';
import {AvailableLanguage} from '../../../../models/language/available-language';

describe('LanguageConfigMapper', () => {
  let languageConfigMapper: LanguageConfigMapper;

  beforeEach(() => {
    languageConfigMapper = new LanguageConfigMapper();
  });

  test('should create a new LanguageConfig instance', () => {
    const inputData: LanguageConfigResponse = {
      defaultLanguage: 'en',
      availableLanguages: [
        { key: 'en', name: 'English' },
        { key: 'fr', name: 'French' }
      ]
    };

    const result = languageConfigMapper.mapToModel(inputData);

    expect(result).toBeInstanceOf(LanguageConfig);
    expect(result.defaultLanguage).toBe('en');

    expect(result.availableLanguages).toBeInstanceOf(AvailableLanguagesList);
    expect(result.availableLanguages.getLanguageCodes()).toEqual(['en', 'fr']);

    const langs = result.availableLanguages.languages;
    expect(langs[0]).toBeInstanceOf(AvailableLanguage);
    expect(langs[0]).toMatchObject({ key: 'en', name: 'English' });

    expect(langs[1]).toBeInstanceOf(AvailableLanguage);
    expect(langs[1]).toMatchObject({ key: 'fr', name: 'French' });

    expect(result).not.toBe(inputData);
  });
});
