import {LanguageStorageService} from '../language-storage.service';
import {LocalStorageService} from '../../storage';

describe('LanguageStorageService', () => {
  let service: LanguageStorageService;

  beforeEach(() => {
    service = new LanguageStorageService();
    service.remove('languageConfig');
  });

  test('set should store the value in local storage with the correct key', () => {
    const key = 'testKey';
    const value = 'testValue';
    const storeValueSpy = jest.spyOn(LocalStorageService.prototype, 'storeValue');

    service.set(key, value);

    expect(storeValueSpy).toHaveBeenCalledWith(key, value);
  });
});
