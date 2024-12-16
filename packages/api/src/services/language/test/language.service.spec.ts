import {LanguageService} from '../language.service';

describe('LanguageService', () => {
  let languageService: LanguageService;

  beforeEach(() => {
    languageService = new LanguageService();
  });

  test('Should return supported languages', () => {
    expect(languageService.getSupportedLanguages()).toEqual(['en', 'fr']);
  });
});
