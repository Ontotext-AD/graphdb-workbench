import {LanguageContextService} from '../language-context.service';
import {LanguageStorageService} from '../language-storage.service';
import {ServiceProvider} from '../../../providers';
import {LanguageService} from '../language.service';
import {LanguageConfig, TranslationBundle} from '../../../models/language';

describe('LanguageContextService', () => {
  let languageContextService: LanguageContextService;
  let languageStorageServiceMock: jest.Mocked<LanguageStorageService>;
  let languageServiceMock: jest.Mocked<LanguageService>;

  beforeEach(() => {
    languageContextService = new LanguageContextService();

    languageServiceMock = {
      getDefaultLanguage: jest.fn(() => 'en'),
    } as unknown as jest.Mocked<LanguageService>;

    languageStorageServiceMock = {
      set: jest.fn(),
    } as unknown as jest.Mocked<LanguageStorageService>;

    // @ts-expect-error the implementation expects a return in every case, but for test purposes we do not need to
    jest.spyOn(ServiceProvider, 'get').mockImplementation((param) => {
      if (param === LanguageStorageService) {
        return languageStorageServiceMock;
      }
      if (param === LanguageService) {
        return languageServiceMock;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('updateSelectedLanguage should update selected language and notify subscribers', async () => {
    const locale = 'fr';
    const validateAndUpdateContextPropertySpy = jest.spyOn(languageContextService, 'validatePropertyChange');

    await languageContextService.updateSelectedLanguage(locale);

    expect(languageStorageServiceMock.set).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, locale);
    expect(validateAndUpdateContextPropertySpy).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, locale);
  });

  test('updateSelectedLanguage should use default language if locale is undefined', async () => {
    const validateAndUpdateContextPropertySpy = jest.spyOn(languageContextService, 'validatePropertyChange');

    await languageContextService.updateSelectedLanguage(undefined);

    const defaultLanguage = languageServiceMock.getDefaultLanguage();
    expect(languageStorageServiceMock.set).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, defaultLanguage);
    expect(validateAndUpdateContextPropertySpy).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, undefined);
  });

  test('should call the "onSelectLanguageCallbackFunction" when the language changes.', async () => {
    const onSelectLanguageCallbackFunction = jest.fn();
    const newLanguage = 'en';

    // When I register a callback function for language changes,
    languageContextService.onSelectedLanguageChanged(onSelectLanguageCallbackFunction);
    // and the selected language is changed.
    await languageContextService.updateSelectedLanguage(newLanguage);

    // Then I expect the callback function to be called with the passed language.
    expect(onSelectLanguageCallbackFunction).toHaveBeenLastCalledWith(newLanguage);
  });

  test('updateLanguageBundle should update language bundle and notify subscribers', () => {
    // Given I have a new translation bundle
    const newBundle: TranslationBundle = {key: 'value'} as TranslationBundle;
    const updateContextPropertySpy = jest.spyOn(languageContextService, 'updateContextProperty');

    // When the language bundle is updated
    languageContextService.updateLanguageBundle(newBundle);

    // Then I expect the updateContextProperty method to be called with the correct parameters
    expect(updateContextPropertySpy).toHaveBeenCalledWith(languageContextService.LANGUAGE_BUNDLE, newBundle);
  });

  test('should call the "onLanguageBundleChangedCallbackFunction" when the language bundle changes.', () => {
    //Given, I have a new translation bundle
    const onLanguageBundleChangedCallbackFunction = jest.fn();
    const newBundle: TranslationBundle = {key: 'value'} as TranslationBundle;

    // When I register a callback function for language bundle changes,
    languageContextService.onLanguageBundleChanged(onLanguageBundleChangedCallbackFunction);
    // And the language bundle is changed.
    languageContextService.updateLanguageBundle(newBundle);

    // Then I expect the callback function to be called with the passed language bundle.
    expect(onLanguageBundleChangedCallbackFunction).toHaveBeenLastCalledWith(newBundle);
  });

  test('updateDefaultBundle should update default bundle and notify subscribers', () => {
    // Given I have a new translation bundle
    const newBundle: TranslationBundle = {key: 'value'} as TranslationBundle;
    const updateContextPropertySpy = jest.spyOn(languageContextService, 'updateContextProperty');

    // When the default bundle is updated
    languageContextService.updateDefaultBundle(newBundle);

    // Then I expect the updateContextProperty method to be called with the correct parameters
    expect(updateContextPropertySpy).toHaveBeenCalledWith(languageContextService.DEFAULT_BUNDLE, newBundle);
  });

  test('should return the default bundle when getDefaultBundle is called', () => {
    // Given I have a default translation bundle
    const defaultBundle: TranslationBundle = {key: 'value'} as TranslationBundle;
    languageContextService.updateDefaultBundle(defaultBundle);

    // When I call getDefaultBundle
    const returnedBundle = languageContextService.getDefaultBundle();

    // Then I expect the returned bundle to be the default bundle
    expect(returnedBundle).toEqual(defaultBundle);
  });

  test('should return the language configuration when getLanguageConfig is called', () => {
    // Given I have a language configuration
    const languageConfig: LanguageConfig = {defaultLanguage: 'en', availableLanguages: ['en', 'fr']} as unknown as LanguageConfig;
    languageContextService.setLanguageConfig(new LanguageConfig(languageConfig));

    // When I call getLanguageConfig
    const returnedConfig = languageContextService.getLanguageConfig();

    // Then I expect the returned config to be the language configuration
    expect(returnedConfig).toEqual(new LanguageConfig(languageConfig));
  });

  test('should get the selected language when getSelectedLanguage is called', async () => {
    // Given I have a selected language
    const selectedLanguage = 'en';
    await languageContextService.updateSelectedLanguage(selectedLanguage);

    // When I call getSelectedLanguage
    const returnedLanguage = languageContextService.getSelectedLanguage();

    // Then I expect the returned language to be the selected language
    expect(returnedLanguage).toEqual('en');
  });

  test('should get the old language when getSelectedLanguage is called and validation does not pass', async () => {
    // Given I have a set initial language 'en'
    const selectedLanguage = 'en';
    await languageContextService.updateSelectedLanguage(selectedLanguage);

    const onSelectLanguageCallbackFunction = jest.fn();
    const validation = jest.fn().mockImplementation(() => Promise.resolve(false));

    // And I have passed a failing validation function
    languageContextService.onSelectedLanguageChanged(onSelectLanguageCallbackFunction, validation);

    const newLanguage = 'fr';
    // When I update to the new language 'fr' with validation
    await languageContextService.updateSelectedLanguage(newLanguage);

    // When I call getSelectedLanguage
    const returnedLanguage = languageContextService.getSelectedLanguage();

    // Then I expect the returned language to be the old language 'en'
    expect(returnedLanguage).toEqual('en');
  });
});
