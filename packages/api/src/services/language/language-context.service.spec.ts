import {LanguageContextService} from './language-context.service';

describe('LanguageContextService', () => {
  let languageContextService: LanguageContextService;

  beforeEach(() => {
    languageContextService = new LanguageContextService();
  });

  test('Should call the "onSelectLanguageCallbackFunction" when the language changes.', () => {
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
