import { LocalStorageService } from '../local-storage.service';

describe('LocalStorageService', () => {

  const prefixedKey = 'ontotext.gdb.domain.testKey';

  beforeEach(() => {
    const storageMock = new StorageMock();
    jest.spyOn(TestStorageService.prototype, 'getStorage')
      .mockImplementation(() => storageMock);
  });

  test('set should store a string value automatically prefixing the key', () => {
    const storageService = new TestStorageService();
    const key = 'testKey';
    const value = 'testValue';

    storageService.set(key, value);

    expect(storageService.getStorage().getItem(prefixedKey)).toBe(value);
  });

  test('get should retrieve a string value by an automatically prefixed key', () => {
    const storageService = new TestStorageService();
    const key = 'testKey';
    const value = 'testValue';

    storageService.set(key, value);
    const storedValue = storageService.get(key).getValue();

    expect(storedValue).toBe(value);
  });

  test('get should retrieve a JSON value as a string', () => {
    const storageService = new TestStorageService();
    const key = 'testKey';
    const value = { value: 'testValue' };

    storageService.set(key, JSON.stringify(value));
    const storedValue = storageService.get(key).getValue();

    expect(storedValue).toBe('{"value":"testValue"}');
  });

  test('get should retrieve a JSON object value', () => {
    const storageService = new TestStorageService();
    const key = 'testKey';
    const value = { value: 'testValue' };

    storageService.set(key, JSON.stringify(value));
    const storedValue = storageService.get(key).getAsJson();

    expect(storedValue).toStrictEqual({'value':'testValue'});
  });

  test('remove should remove a value', () => {
    const storageService = new TestStorageService();
    const key = 'testKey';
    const value = 'testValue';

    storageService.set(key, value);
    // check if it's there
    expect(storageService.getStorage().getItem(prefixedKey)).toBe(value);

    storageService.remove(key);
    const storedValue = storageService.get(key).getValue();

    expect(storedValue).toBeNull();
  });
});

class TestStorageService extends LocalStorageService {
  getLocalKey(key: string): string {
    return 'domain.' + key;
  }

  set(key: string, value: string) {
    this.storeValue(this.getLocalKey(key), value);
  }

  getStorage(): Storage {
    return localStorage;
  }
}

class StorageMock  implements Storage {
  private storage: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.storage).length;
  }

  clear(): void {
    this.storage = {};
  }

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  key(index: number): string | null {
    return Object.keys(this.storage)[index] || null;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }
}
