import {AuthenticationStorageService} from '../authentication-storage.service';

describe('AuthenticationStorageService', () => {
  let authStorageService: AuthenticationStorageService;

  beforeEach(() => {
    authStorageService = new AuthenticationStorageService();
  });

  test('should get auth token from the store', () => {
    // Given, I have a stored authentication token
    const token = 'token';
    // When I set the token in the store
    authStorageService.set('jwt', token);
    // Then I get the token from the store
    expect(authStorageService.getAuthToken().getValue()).toEqual(token);
  });

  describe('isLoginOrLogout', () => {
    const storageEvent = (key: string, oldValue: string | null, newValue: string | null) =>
      new StorageEvent('storage', {key: `ontotext.gdb.auth.${key}`, oldValue, newValue});

    test('should be true when the token is set or removed', () => {
      expect(authStorageService.isLoginOrLogout(storageEvent('jwt', null, 'GDB token'))).toBe(true);
      expect(authStorageService.isLoginOrLogout(storageEvent('jwt', 'GDB token', null))).toBe(true);
    });

    test('should be true when the authenticated state changes', () => {
      expect(authStorageService.isLoginOrLogout(storageEvent('authenticated', 'true', 'false'))).toBe(true);
    });

    test('should be false when the token is refreshed', () => {
      expect(authStorageService.isLoginOrLogout(storageEvent('jwt', 'Bearer old', 'Bearer new'))).toBe(false);
    });

    test('should be false for another key', () => {
      expect(authStorageService.isLoginOrLogout(storageEvent('selectedRepository', null, 'repo'))).toBe(false);
    });
  });
});
