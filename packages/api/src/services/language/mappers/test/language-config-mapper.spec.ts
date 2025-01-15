import { LanguageConfigMapper } from '../language-config-mapper';
import { LanguageConfig } from '../../../../models/language';

describe('LanguageConfigMapper', () => {
  let languageConfigMapper: LanguageConfigMapper;

  beforeEach(() => {
    languageConfigMapper = new LanguageConfigMapper();
  });

  test('should create a new LanguageConfig instance', () => {
    // Given, I have a JSON input data object representing a LanguageConfig.
    const inputData = {
      defaultLanguage: 'en',
      availableLanguages: [
        {key: 'en', name: 'English'},
        {key: 'fr', name: 'French'},
      ]
    } as unknown as LanguageConfig;

    // When, I map the JSON input data to a LanguageConfig instance.
    const result = languageConfigMapper.mapToModel(inputData);

    // Then, I expect a new LanguageConfig instance to be created.
    expect(result).toBeInstanceOf(LanguageConfig);
    expect(result).toEqual(new LanguageConfig(inputData));
    expect(result).not.toBe(inputData);
  });
});
