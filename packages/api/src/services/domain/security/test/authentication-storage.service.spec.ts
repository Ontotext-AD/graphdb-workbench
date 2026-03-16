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
});
