import {SparqlStorageService} from '../sparql-storage.service';
import {createMockStorage, MutableStorage} from '../../../utils/test/local-storage-mock';
import {LoggerProvider} from '../../../logging/logger-provider';

const LAST_USED_REPOSITORY_KEY = 'ontotext.gdb.sparqlEditor.lastUsedRepository';
const LEGACY_LAST_USED_REPOSITORY_KEY = 'ls.sparql-last-repo';

describe('SparqlStorageService', () => {
  let service: SparqlStorageService;
  let storage: MutableStorage;
  let removeItemSpy: jest.SpyInstance;
  let loggerInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    storage = createMockStorage();
    removeItemSpy = jest.spyOn(storage, 'removeItem');
    loggerInfoSpy = jest.spyOn(LoggerProvider.logger, 'info').mockImplementation(() => {
      // no-op to suppress log output during tests
    });
    service = new SparqlStorageService();
    jest.spyOn(SparqlStorageService.prototype, 'getStorage').mockReturnValue(storage);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('set', () => {
    it('should store a value under the prefixed key', () => {
      service.set('someKey', 'someValue');

      expect(storage.getItem('ontotext.gdb.sparqlEditor.someKey')).toBe('someValue');
    });
  });

  describe('setLastUsedRepository', () => {
    it('should store the repository ID under the expected prefixed key', () => {
      service.setLastUsedRepository('my-repo');

      expect(storage.getItem(LAST_USED_REPOSITORY_KEY)).toBe('my-repo');
    });

    it('should overwrite a previously stored repository ID', () => {
      service.setLastUsedRepository('first-repo');
      service.setLastUsedRepository('second-repo');

      expect(storage.getItem(LAST_USED_REPOSITORY_KEY)).toBe('second-repo');
    });
  });

  describe('getLastUsedRepository', () => {
    it('should return the stored repository ID', () => {
      storage.setItem(LAST_USED_REPOSITORY_KEY, 'my-repo');

      const result = service.getLastUsedRepository();

      expect(result).toBe('my-repo');
    });

    it('should return null when no repository ID is stored', () => {
      const result = service.getLastUsedRepository();

      expect(result).toBeNull();
    });
  });

  describe('migrateLegacyLastUsedRepositoryKey', () => {
    it('should migrate legacy key to the new key and remove the legacy key', () => {
      storage.setItem(LEGACY_LAST_USED_REPOSITORY_KEY, 'legacy-repo');

      const result = service.getLastUsedRepository();

      expect(result).toBe('legacy-repo');
      expect(storage.getItem(LAST_USED_REPOSITORY_KEY)).toBe('legacy-repo');
      expect(removeItemSpy).toHaveBeenCalledWith(LEGACY_LAST_USED_REPOSITORY_KEY);
    });

    it('should log an info message when migrating the legacy key', () => {
      storage.setItem(LEGACY_LAST_USED_REPOSITORY_KEY, 'legacy-repo');

      service.getLastUsedRepository();

      expect(loggerInfoSpy).toHaveBeenCalledWith(
        'Legacy last used repository data found. Migrating to new key.',
        expect.objectContaining({legacyData: 'legacy-repo'})
      );
    });

    it('should not migrate when no legacy key is present', () => {
      service.getLastUsedRepository();

      expect(removeItemSpy).not.toHaveBeenCalled();
      expect(loggerInfoSpy).not.toHaveBeenCalled();
    });

    it('should overwrite the new key with legacy data when both keys are present', () => {
      storage.setItem(LEGACY_LAST_USED_REPOSITORY_KEY, 'legacy-repo');
      storage.setItem(LAST_USED_REPOSITORY_KEY, 'new-repo');

      const result = service.getLastUsedRepository();

      expect(result).toBe('legacy-repo');
      expect(removeItemSpy).toHaveBeenCalledWith(LEGACY_LAST_USED_REPOSITORY_KEY);
    });
  });
});

