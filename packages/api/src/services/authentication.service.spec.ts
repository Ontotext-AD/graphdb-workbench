// src/__tests__/authenticationService.test.ts
import {AuthenticationService} from './authentication.service';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = new AuthenticationService();
  });

  test('should return the correct login message', () => {
    const result = authService.login();
    expect(result).toBe('Authentication.login from the API');
  });
});
