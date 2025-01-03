import {LanguageContextService} from '../language-context.service';
import {LanguageStorageService} from '../language-storage.service';
import {ServiceProvider} from '../../../providers';
import {LanguageService} from '../language.service';

describe('LanguageContextService', () => {
  let languageContextService: LanguageContextService;
  let languageStorageServiceMock: jest.Mocked<LanguageStorageService>;

  beforeEach(() => {
    languageContextService = new LanguageContextService();
    languageStorageServiceMock = {
      set: jest.fn(),
    } as unknown as jest.Mocked<LanguageStorageService>;

    jest.spyOn(ServiceProvider, 'get').mockReturnValue(languageStorageServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('updateSelectedLanguage should update selected language and notify subscribers', () => {
    const locale = 'fr';
    const updateContextPropertySpy = jest.spyOn(languageContextService, 'updateContextProperty');

    languageContextService.updateSelectedLanguage(locale);

    expect(languageStorageServiceMock.set).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, locale);
    expect(updateContextPropertySpy).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, locale);
  });

  test('updateSelectedLanguage should use default language if locale is undefined', () => {
    const updateContextPropertySpy = jest.spyOn(languageContextService, 'updateContextProperty');

    languageContextService.updateSelectedLanguage(undefined);

    expect(languageStorageServiceMock.set).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, LanguageService.DEFAULT_LANGUAGE);
    expect(updateContextPropertySpy).toHaveBeenCalledWith(languageContextService.SELECTED_LANGUAGE, undefined);
  });

  test('should call the "onSelectLanguageCallbackFunction" when the language changes.', () => {
    const onSelectLanguageCallbackFunction = jest.fn();
    const newLanguage = 'en';

    // When I register a callback function for language changes,
    languageContextService.onSelectedLanguageChanged(onSelectLanguageCallbackFunction);
    // and the selected language is changed.
    languageContextService.updateSelectedLanguage(newLanguage);

    // Then I expect the callback function to be called with the passed language.
    expect(onSelectLanguageCallbackFunction).toHaveBeenLastCalledWith(newLanguage);
  });
});
