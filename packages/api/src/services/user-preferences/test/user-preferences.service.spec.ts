import { service } from '../../../providers';
import { UserPreferencesService } from '../user-preferences.service';
import { AuthenticationService, SecurityContextService } from '../../domain/security';
import {AuthenticatedUser,} from '../../../models/security';
import {UserPreferencesStorageService} from '../user-preferences-storage.service';
import {StorageData} from '../../../models/storage';
import {UserPreferencesContextService} from '../user-preferences-context.service';
import {UserPreferences} from '../../../models/user-preference/user-preferences';
import {UsersPreferences} from '../../../models/user-preference/users-preferences';

/**
 * Holds persisted user preferences stored in local storage.
 */
const STORAGE_PREFERENCES = '{"preferences":{"admin":{"isSolrDeprecationBannerDismissed":true}},"version":1}';

const ADMIN_STORED_PREFERENCES = new UserPreferences({isSolrDeprecationBannerDismissed: true});
const DEFAULT_PREFERENCES = new UserPreferences({isSolrDeprecationBannerDismissed: false});
const SOLR_BANNER_DISMISSED_USER_PREFERENCES = new UserPreferences({isSolrDeprecationBannerDismissed: true});
const SOLR_BANNER_NOT_DISMISSED_USER_PREFERENCES = new UserPreferences({isSolrDeprecationBannerDismissed: false});

const mockAuthenticatedUser = (username: string): void => {
  jest.spyOn(service(SecurityContextService), 'getAuthenticatedUser')
    .mockReturnValue(new AuthenticatedUser({username}));
};

const mockIsLoggedIn = (isLoggedIn: boolean): void => {
  jest.spyOn(service(AuthenticationService), 'isLoggedIn')
    .mockReturnValue(isLoggedIn);
};

const mockUserPreferencesContext = (userPreferences?: UserPreferences): void => {
  jest.spyOn(service(UserPreferencesContextService), 'getUserPreferences')
    .mockReturnValue(userPreferences);
};

describe('UserPreferencesService', () => {
  let userPreferencesService: UserPreferencesService;
  let updateUserPreferencesSpy: jest.SpyInstance<void, [UserPreferences]>;
  let setUsersPreferencesSpy: jest.SpyInstance<void, [UsersPreferences]>;

  beforeEach(() => {
    updateUserPreferencesSpy = jest.spyOn(service(UserPreferencesContextService), 'updateUserPreferences');
    setUsersPreferencesSpy = jest.spyOn(service(UserPreferencesStorageService), 'setUsersPreferences');
    jest.spyOn(service(UserPreferencesStorageService), 'get').mockReturnValue(new StorageData(STORAGE_PREFERENCES));
    userPreferencesService = new UserPreferencesService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dismissSolrDeprecationBanner', () => {
    it('should persist preference and update context when user is logged in', () => {
      // GIVEN: A user is authenticated.
      mockIsLoggedIn(true);
      mockAuthenticatedUser('user');
      const expectedStorageObject = new UsersPreferences({
        preferences: {
          admin: ADMIN_STORED_PREFERENCES,
          user: SOLR_BANNER_DISMISSED_USER_PREFERENCES
        }
      });

      // WHEN: The Solr deprecation banner is dismissed.
      userPreferencesService.dismissSolrDeprecationBanner();

      // THEN: I expect the preference to be persisted.
      expect(setUsersPreferencesSpy).toHaveBeenCalledWith(expectedStorageObject);
      // AND: I expect the context to be updated.
      expect(updateUserPreferencesSpy).toHaveBeenCalledWith(SOLR_BANNER_DISMISSED_USER_PREFERENCES);
    });

    it('should update only context when user is not logged in', () => {
      // GIVEN: No user is authenticated.
      mockIsLoggedIn(false);

      // WHEN: The Solr deprecation banner is dismissed.
      userPreferencesService.dismissSolrDeprecationBanner();

      // THEN: I expect the preference not to be persisted.
      expect(setUsersPreferencesSpy).not.toHaveBeenCalled();
      // AND: I expect only the context to be updated.
      expect(updateUserPreferencesSpy).toHaveBeenCalledWith(SOLR_BANNER_DISMISSED_USER_PREFERENCES);
    });
  });

  describe('loadUserPreferences', () => {
    it('should load persisted preferences when user is logged in', () => {
      // GIVEN: Persisted preferences exist for the authenticated user.
      mockAuthenticatedUser('admin');
      // AND: The user is logged in.
      mockIsLoggedIn(true);

      // WHEN: User preferences are loaded.
      userPreferencesService.loadUserPreferences();

      // THEN: I expect the persisted preferences to be loaded into the context.
      expect(updateUserPreferencesSpy).toHaveBeenCalledWith(ADMIN_STORED_PREFERENCES);
    });

    it('should load default preferences when user is logged in but no persisted preferences exist', () => {
      // GIVEN: No persisted preferences exist for the authenticated user.
      mockAuthenticatedUser('user');
      // AND: The user is logged in.
      mockIsLoggedIn(true);

      // WHEN: User preferences are loaded.
      userPreferencesService.loadUserPreferences();

      // THEN: I expect the default preferences to be loaded into the context.
      expect(updateUserPreferencesSpy).toHaveBeenCalledWith(DEFAULT_PREFERENCES);
    });

    it('should load default in-memory preferences when user is not logged in', () => {
      // GIVEN: No user is authenticated.
      mockIsLoggedIn(false);

      // WHEN: User preferences are loaded.
      userPreferencesService.loadUserPreferences();

      // THEN: I expect the default preferences to be loaded into the context.
      expect(updateUserPreferencesSpy).toHaveBeenCalledWith(DEFAULT_PREFERENCES);
    });
  });

  describe('isSolrDeprecationBannerDismissed', () => {
    it('should return true when banner is dismissed', () => {
      // GIVEN: The banner is marked as dismissed in the current context.
      mockUserPreferencesContext(SOLR_BANNER_DISMISSED_USER_PREFERENCES);

      // WHEN: The banner state is requested.
      const isSolrDeprecationBannerDismissed = userPreferencesService.isSolrDeprecationBannerDismissed();

      // THEN: The service reports that the banner is dismissed.
      expect(isSolrDeprecationBannerDismissed).toBe(true);
    });

    it('should return false when banner is not dismissed', () => {
      // GIVEN: The banner is not dismissed.
      mockUserPreferencesContext(SOLR_BANNER_NOT_DISMISSED_USER_PREFERENCES);

      // WHEN: The banner state is requested.
      const isSolrDeprecationBannerDismissed = userPreferencesService.isSolrDeprecationBannerDismissed();

      // THEN: The service reports that the banner is not dismissed.
      expect(isSolrDeprecationBannerDismissed).toBe(false);
    });

    it('should return false when preferences are not loaded', () => {
      // GIVEN: No user preferences are available in the context.
      mockUserPreferencesContext(undefined);

      // WHEN: The banner state is requested.
      const isSolrDeprecationBannerDismissed = userPreferencesService.isSolrDeprecationBannerDismissed();

      // THEN: The service reports that the banner is not dismissed.
      expect(isSolrDeprecationBannerDismissed).toBe(false);
    });
  });
});
