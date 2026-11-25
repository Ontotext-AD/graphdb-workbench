import {SessionStorageService} from '../session-storage.service';

describe('SessionStorageService', () => {
  const prefixedKey = 'ontotext.gdb.domain.testKey';

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  test('set should store the value in the sessionStorage under a prefixed key', () => {
    // Given a session storage service
    const storageService = new TestSessionStorageService();

    // When a value is set
    storageService.set('testKey', 'testValue');

    // Then it is in the sessionStorage under the prefixed key, and not in the localStorage
    expect(sessionStorage.getItem(prefixedKey)).toBe('testValue');
    expect(localStorage.getItem(prefixedKey)).toBeNull();
  });

  test('get should return the value stored in the sessionStorage', () => {
    // Given a value in the sessionStorage under the prefixed key
    sessionStorage.setItem(prefixedKey, 'testValue');
    const storageService = new TestSessionStorageService();

    // When the value is read
    const storedValue = storageService.get('testKey').getValue();

    // Then the stored value is returned
    expect(storedValue).toBe('testValue');
  });

  test('remove should remove the value from the sessionStorage', () => {
    // Given a value in the sessionStorage under the prefixed key
    sessionStorage.setItem(prefixedKey, 'testValue');
    const storageService = new TestSessionStorageService();

    // When the value is removed
    storageService.remove('testKey');

    // Then it is no longer in the sessionStorage
    expect(sessionStorage.getItem(prefixedKey)).toBeNull();
  });
});

class TestSessionStorageService extends SessionStorageService {
  readonly NAMESPACE = 'domain';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }
}
