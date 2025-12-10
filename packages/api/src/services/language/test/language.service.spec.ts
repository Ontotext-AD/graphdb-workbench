import {LanguageService} from '../language.service';
import {ServiceProvider} from '../../../providers';
import {AvailableLanguagesList, LanguageConfig, TranslationBundle} from '../../../models/language';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {LanguageContextService} from '../language-context.service';
import {LanguageConfigResponse, LanguageConfigMapper} from '../mappers/language-config-mapper';
import {AvailableLanguage} from '../../../models/language/available-language';

describe('LanguageService', () => {
  let languageService: LanguageService;

  beforeEach(() => {
    languageService = new LanguageService();
    ServiceProvider.get(LanguageContextService).setLanguageConfig(undefined);
  });

  test('Should return default languages, when there is no config', () => {
    expect(languageService.getSupportedLanguages()).toEqual(['en', 'fr']);
  });

  test('Should return supported languages from the configuration', () => {
    // Given, I have a language configuration stored in the storage service with supported languages.
    const availableLanguages = [
      { key: 'de', name: 'German' },
      { key: 'es', name: 'Spanish' },
    ];

    const dto: LanguageConfigResponse = {
      defaultLanguage: 'en',
      availableLanguages,
    };

    const mappedConfig = new LanguageConfigMapper().mapToModel(dto);
    ServiceProvider.get(LanguageContextService).setLanguageConfig(mappedConfig);

    // When I call getSupportedLanguages in a newly created instance of LanguageService
    // to ensure it gets the languages from the mock configuration.
    const result = new LanguageService().getSupportedLanguages();

    // Then, I expect the supported languages to be returned from the configuration.
    expect(result).toEqual(['de', 'es']);
  });

  test('Should return a default language', () => {
    expect(languageService.getDefaultLanguage()).toBe('en');
  });

  test('Should return default language from configuration', () => {
    // Given, I have a language configuration stored in the storage service with default language.
    const languageConfig = {
      defaultLanguage: 'fr',
      availableLanguages: []
    } as unknown as LanguageConfig;
    ServiceProvider.get(LanguageContextService).setLanguageConfig(languageConfig);

    // When, I call getDefaultLanguage
    const result = new LanguageService().getDefaultLanguage();

    // Then, I expect the default language to be returned from the configuration.
    expect(result).toBe('fr');
  });

  test('Should get default language without configuration', () => {
    expect(languageService.getDefaultLanguage()).toEqual('en');
  });

  test('Should retrieve the language, mapped to a TranslationBundle object', async () => {
    // Given, I have a mocked language
    const mockBundle = { hello: 'World', language: 'en' } as TranslationBundle;
    TestUtil.mockResponse(new ResponseMock('assets/i18n/en.json').setResponse(mockBundle));

    // When I call the getLanguage method
    const result = await languageService.getLanguage('en');

    const expectedTranslationBundle = {
      hello: 'World',
      language: 'en'
    };

    // Then, I should get a TranslationBundle object, with default property values
    expect(result).toEqual(expectedTranslationBundle);
  });

  test('Should retrieve the language configuration', async () => {
    // Given, I have a mocked language configuration
    const mockLanguageConfig: LanguageConfigResponse = {
      defaultLanguage: 'en',
      availableLanguages: [
        {
          key: 'en',
          name: 'English'
        }
      ]
    };
    TestUtil.mockResponse(new ResponseMock('assets/i18n/language-config.json').setResponse(mockLanguageConfig));

    // When I call the getLanguageConfiguration method
    const result = await languageService.getLanguageConfiguration();

    // Then I build the expected model
    const expected = new LanguageConfig({
      defaultLanguage: 'en',
      availableLanguages: new AvailableLanguagesList([
        new AvailableLanguage({ key: 'en', name: 'English' }),
      ]),
    } as LanguageConfig);

    // Then, I should get a LanguageConfig object with mapped values
    expect(result).toBeInstanceOf(LanguageConfig);
    expect(result).toEqual(expected);
  });
});
