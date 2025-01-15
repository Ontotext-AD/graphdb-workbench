import { AvailableLanguagesListMapper } from '../available-languages-list-mapper';
import { AvailableLanguagesList } from '../../../../models/language/available-languages-list';
import { AvailableLanguage } from '../../../../models/language/available-language';

describe('AvailableLanguagesListMapper', () => {
  let mapper: AvailableLanguagesListMapper;

  beforeEach(() => {
    mapper = new AvailableLanguagesListMapper();
  });
  test('should correctly map a single AvailableLanguage object', () => {
    // Given, I have a single AvailableLanguage object.
    const singleLanguage = {
      key: 'en',
      name: 'English'
    } as unknown as AvailableLanguage;

    // When, I map the AvailableLanguage object to an AvailableLanguagesList.
    const result = mapper.mapToModel([singleLanguage]);

    // Then, I should get an AvailableLanguagesList containing the single AvailableLanguage object.
    expect(result).toBeInstanceOf(AvailableLanguagesList);
    expect(result.languages).toHaveLength(1);
    expect(result.languages[0]).toEqual(singleLanguage);
  });
});
