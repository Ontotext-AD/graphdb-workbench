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
    expect(onSelectLanguageCallbackFunction.mock.lastCall[0]).toEqual(newLanguage);
  });

  test('should stop calling the "onSelectLanguageCallbackFunction" when unsubscribed from the event.', () => {
    const onSelectLanguageCallbackFunction = jest.fn();
    // Given:
    // I have registered the onSelectLanguageCallbackFunction as a callback.
    const unsubscribeFunction = languageContextService.onSelectedLanguageChanged(onSelectLanguageCallbackFunction);
    // Clear the first callback call when the callback function is registered.
    onSelectLanguageCallbackFunction.mockClear();

    // When I unsubscribe the function from the language change event,
    unsubscribeFunction();
    // and the selected language is updated.
    languageContextService.updateSelectedLanguage('fr');

    // Then I expect the callback function not to be called.
    expect(onSelectLanguageCallbackFunction).toHaveBeenCalledTimes(0);
  });
});
