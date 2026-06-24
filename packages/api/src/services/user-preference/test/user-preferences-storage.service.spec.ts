import { UserPreferencesStorageService } from '../user-preferences-storage.service';
import { createMockStorage, MutableStorage } from '../../utils/test/local-storage-mock';

const USER_PREFERENCES_NAMESPACE = 'ontotext.gdb.userPreferences';
const SOLR_DEPRECATION_BANNER_DISMISSED_KEY = `${USER_PREFERENCES_NAMESPACE}.solrDeprecationBannerDismissed`;

describe('UserPreferencesStorageService', () => {
  let userPreferencesStorageService: UserPreferencesStorageService;
  let storage: MutableStorage;

  beforeEach(() => {
    storage = createMockStorage();
    userPreferencesStorageService = new UserPreferencesStorageService();

    jest
      .spyOn(UserPreferencesStorageService.prototype, 'getStorage')
      .mockReturnValue(storage);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('set', () => {
    it('should store a value under the prefixed key', () => {
      // WHEN: A value is stored in the user preferences.
      userPreferencesStorageService.set('someKey', 'someValue');
      // THEN: I expect the value to be stored under the prefixed key.
      expect(storage.getItem(`${USER_PREFERENCES_NAMESPACE}.someKey`)).toBe('someValue');
    });
  });

  describe('dismissSolrDeprecationBanner', () => {
    it('should store that the Solr deprecation banner is dismissed', () => {
      // WHEN: The Solr deprecation banner is dismissed.
      userPreferencesStorageService.dismissSolrDeprecationBanner();
      // THEN: I expect the dismissed state to be stored.
      expect(storage.getItem(SOLR_DEPRECATION_BANNER_DISMISSED_KEY)).toBe('true');
    });
  });

  describe('isSolrDeprecationBannerDismissed', () => {
    it('should return true when the Solr deprecation banner is dismissed', () => {
      // GIVEN: The Solr deprecation banner is marked as dismissed.
      storage.setItem(SOLR_DEPRECATION_BANNER_DISMISSED_KEY, 'true');

      // WHEN: I check whether the banner is dismissed.
      const result = userPreferencesStorageService.isSolrDeprecationBannerDismissed();
      // THEN: I expect the banner to be reported as dismissed.
      expect(result).toBe(true);
    });

    it('should return false when the Solr deprecation banner is not dismissed', () => {
      // WHEN: I check whether the banner is dismissed.
      const result = userPreferencesStorageService.isSolrDeprecationBannerDismissed();
      // THEN: I expect the banner to not be reported as dismissed.
      expect(result).toBe(false);
    });

    it('should return false when the stored value is not true', () => {
      // GIVEN: The stored value is not equal to true.
      storage.setItem(SOLR_DEPRECATION_BANNER_DISMISSED_KEY, 'false');

      // WHEN: I check whether the banner is dismissed.
      const result = userPreferencesStorageService.isSolrDeprecationBannerDismissed();
      // THEN: I expect the banner to not be reported as dismissed.
      expect(result).toBe(false);
    });
  });
});
