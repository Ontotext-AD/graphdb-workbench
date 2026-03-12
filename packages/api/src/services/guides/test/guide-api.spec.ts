import {GuideApi} from '../guide-api';
import {LanguageContextService} from '../../language';
import {service} from '../../../providers';
import {LoggerProvider} from '../../logging/logger-provider';

// jsdom does not support DOMParser#body.innerText — mock it globally
const mockDOMParserParse = jest.fn((html: string) => ({
  body: {innerText: html},
}));
global.DOMParser = jest.fn().mockImplementation(() => ({
  parseFromString: mockDOMParserParse,
}));

describe('GuideApi', () => {
  let guideApi: GuideApi;
  const languageContextService = service(LanguageContextService);
  const logger = LoggerProvider.logger;

  beforeEach(() => {
    jest.spyOn(languageContextService, 'getLanguageBundle').mockReturnValue(undefined);
    jest.spyOn(languageContextService, 'getDefaultBundle').mockReturnValue(undefined);
    jest.spyOn(languageContextService, 'getSelectedLanguage').mockReturnValue('en');
    jest.spyOn(languageContextService, 'getDefaultLanguage').mockReturnValue('en');
    guideApi = new GuideApi();
  });

  describe('translate', () => {
    test('should return the translation from the provided bundle', () => {
      const bundle = {language: 'en', 'greeting': 'Hello'};
      expect(guideApi.translate(bundle, 'greeting')).toBe('Hello');
    });

    test('should fall back to the default bundle when key is missing in the provided bundle', () => {
      jest.spyOn(languageContextService, 'getDefaultBundle').mockReturnValue({language: 'en', 'fallback-key': 'Fallback value'});

      expect(guideApi.translate({language: 'en', 'other-key': 'Other'}, 'fallback-key')).toBe('Fallback value');
    });

    test('should fall back to the language bundle from context when bundle is undefined', () => {
      jest.spyOn(languageContextService, 'getLanguageBundle').mockReturnValue({language: 'en', 'context-key': 'From context'});

      expect(guideApi.translate(undefined, 'context-key')).toBe('From context');
    });

    test('should warn and return the key when translation is not found in any bundle', () => {
      const warnSpy = jest.spyOn(logger, 'warn');
      jest.spyOn(languageContextService, 'getDefaultBundle').mockReturnValue({language: 'en'});

      const result = guideApi.translate({language: 'en'}, 'not-found');

      expect(result).toBe('not-found');
      expect(warnSpy).toHaveBeenCalledWith('Missing translation for [not-found] key');
    });

    test('should apply parameters to the translated string', () => {
      const bundle = {language: 'en', 'welcome': 'Hello {{name}}, you are {{age}} years old'};
      const parameters = {name: 'Alice', age: '30'};

      expect(guideApi.translate(bundle, 'welcome', parameters)).toBe('Hello Alice, you are 30 years old');
    });

    test('should resolve a key that is a per-language object using the current language', () => {
      jest.spyOn(languageContextService, 'getSelectedLanguage').mockReturnValue('fr');

      const key = {language: 'test', 'en': 'Hello', 'fr': 'Bonjour'};
      expect(guideApi.translate(undefined, key)).toBe('Bonjour');
    });

    test('should fall back to default language when per-language object does not have the current language', () => {
      jest.spyOn(languageContextService, 'getSelectedLanguage').mockReturnValue(undefined);
      jest.spyOn(languageContextService, 'getDefaultLanguage').mockReturnValue('en');

      const key = {language: 'test', 'en': 'Hello'};
      expect(guideApi.translate(undefined, key)).toBe('Hello');
    });

    test('should warn and return empty string when per-language object has no matching language', () => {
      const warnSpy = jest.spyOn(logger, 'warn');
      jest.spyOn(languageContextService, 'getSelectedLanguage').mockReturnValue('de');
      jest.spyOn(languageContextService, 'getDefaultLanguage').mockReturnValue('de');

      const key = {language: 'test', 'en': 'Hello'};
      const result = guideApi.translate(undefined, key);

      expect(result).toBe('');
      expect(warnSpy).toHaveBeenCalledWith('Missing translation for language [de] in message object');
    });
  });

  describe('sanitize', () => {
    test('should pass the html string through DOMParser and return innerText', () => {
      mockDOMParserParse.mockReturnValueOnce({body: {innerText: 'Hello & World'}});
      expect(guideApi.sanitize('Hello &amp; World')).toBe('Hello & World');
    });

    test('should return plain text unchanged when DOMParser returns it as-is', () => {
      mockDOMParserParse.mockReturnValueOnce({body: {innerText: 'Hello World'}});
      expect(guideApi.sanitize('Hello World')).toBe('Hello World');
    });

    test('should return empty string when DOMParser returns empty innerText', () => {
      mockDOMParserParse.mockReturnValueOnce({body: {innerText: ''}});
      expect(guideApi.sanitize('')).toBe('');
    });

    test('should call DOMParser.parseFromString with text/html mime type', () => {
      mockDOMParserParse.mockReturnValueOnce({body: {innerText: 'test'}});
      guideApi.sanitize('<b>test</b>');
      expect(mockDOMParserParse).toHaveBeenCalledWith('<b>test</b>', 'text/html');
    });
  });

  describe('applyParameters', () => {
    test('should replace a single placeholder', () => {
      expect(guideApi.applyParameters('Hello {{name}}', {name: 'Alice'})).toBe('Hello Alice');
    });

    test('should replace multiple placeholders', () => {
      expect(guideApi.applyParameters('{{a}} and {{b}}', {a: 'foo', b: 'bar'})).toBe('foo and bar');
    });

    test('should replace all occurrences of the same placeholder', () => {
      expect(guideApi.applyParameters('{{x}} {{x}}', {x: 'hi'})).toBe('hi hi');
    });

    test('should return the original string when parameters are empty', () => {
      expect(guideApi.applyParameters('Hello {{name}}', {})).toBe('Hello {{name}}');
    });
  });

  describe('waitFor', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should resolve when element exists and is visible', async () => {
      const mockElement = createMockElement();
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      const promise = guideApi.waitFor('.my-element');
      jest.advanceTimersByTime(100);

      await expect(promise).resolves.toBe(mockElement);
    });

    test('should reject when element is not found within timeout', async () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);

      const promise = guideApi.waitFor('.missing', 0.2);
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow('Element is not found: .missing');
    });

    test('should reject when element exists but is not visible within timeout', async () => {
      const mockElement = createMockElement({display: 'none'});
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      const promise = guideApi.waitFor('.hidden', 0.2);
      jest.advanceTimersByTime(300);

      await expect(promise).rejects.toThrow('Element is not visible: .hidden');
    });

    test('should resolve when element appears after initial absence', async () => {
      const mockElement = createMockElement();
      jest.spyOn(document, 'querySelector')
        .mockReturnValueOnce(null)
        .mockReturnValue(mockElement);

      const promise = guideApi.waitFor('.delayed');
      jest.advanceTimersByTime(200);

      await expect(promise).resolves.toBe(mockElement);
    });

    test('should skip visibility check when checkVisibility is false', async () => {
      const mockElement = createMockElement({display: 'none'});
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      const promise = guideApi.waitFor('.hidden', 1, false);
      jest.advanceTimersByTime(100);

      await expect(promise).resolves.toBe(mockElement);
    });

    test('should resolve selector function before querying', async () => {
      const mockElement = createMockElement();
      const querySpy = jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      const promise = guideApi.waitFor(() => '.dynamic-selector');
      jest.advanceTimersByTime(100);

      await expect(promise).resolves.toBe(mockElement);
      expect(querySpy).toHaveBeenCalledWith('.dynamic-selector');
    });
  });

  describe('getOrWaitFor', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should resolve immediately when element already exists and is visible', async () => {
      const mockElement = createMockElement();
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      const result = await guideApi.getOrWaitFor('.existing');
      expect(result).toBe(mockElement);
    });

    test('should fall back to waitFor when element does not exist yet', async () => {
      const mockElement = createMockElement();
      jest.spyOn(document, 'querySelector')
        .mockReturnValueOnce(null) // getOrWaitFor initial check
        .mockReturnValueOnce(null) // waitFor first poll
        .mockReturnValue(mockElement); // waitFor second poll

      const promise = guideApi.getOrWaitFor('.delayed');
      jest.advanceTimersByTime(200);

      await expect(promise).resolves.toBe(mockElement);
    });

    test('should fall back to waitFor when element exists but is not visible', async () => {
      const hiddenElement = createMockElement({display: 'none'});
      const visibleElement = createMockElement();
      jest.spyOn(document, 'querySelector')
        .mockReturnValueOnce(hiddenElement) // getOrWaitFor initial check — not visible
        .mockReturnValue(visibleElement); // waitFor finds visible element

      const promise = guideApi.getOrWaitFor('.becoming-visible');
      jest.advanceTimersByTime(100);

      await expect(promise).resolves.toEqual(visibleElement);
    });

    test('should resolve immediately without visibility check when checkVisibility is false', async () => {
      const mockElement = createMockElement({display: 'none'});
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement);

      const result = await guideApi.getOrWaitFor('.hidden', 1, false);
      expect(result).toBe(mockElement);
    });
  });

  describe('scrollToOffset', () => {
    let scrollToSpy: jest.SpyInstance;

    beforeEach(() => {
      scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
    });

    test('should scroll to a numeric offset', () => {
      guideApi.scrollToOffset(200);
      expect(scrollToSpy).toHaveBeenCalledWith({top: 200, behavior: 'smooth'});
    });

    test('should scroll to top when offset is "start"', () => {
      guideApi.scrollToOffset('start');
      expect(scrollToSpy).toHaveBeenCalledWith({top: 0, behavior: 'smooth'});
    });

    test('should scroll to center of viewport when offset is "center"', () => {
      guideApi.scrollToOffset('center');
      expect(scrollToSpy).toHaveBeenCalledWith({top: window.innerHeight / 2, behavior: 'smooth'});
    });

    test('should fall back to the raw string value when offset is an unknown string', () => {
      guideApi.scrollToOffset('unknown');
      expect(scrollToSpy).toHaveBeenCalledWith({top: 'unknown', behavior: 'smooth'});
    });
  });
});

function createMockElement(styleOverrides: Record<string, string> = {}): Element {
  const defaults: Record<string, string> = {display: 'block', visibility: 'visible', opacity: '1'};
  const styles = {...defaults, ...styleOverrides};

  const element = document.createElement('div');
  jest.spyOn(window, 'getComputedStyle').mockReturnValue(styles as unknown as CSSStyleDeclaration);
  jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({width: 100, height: 50} as DOMRect);
  return element;
}

