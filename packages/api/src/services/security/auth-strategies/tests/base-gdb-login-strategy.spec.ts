import {BaseGdbLoginStrategy} from '../base-gdb-login-strategy';
import {AuthStrategyType} from '../../../../models/security/authentication';
import {ServiceProvider} from '../../../../providers';
import {AuthenticationStorageService} from '../../authentication-storage.service';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {ProviderResponseMocks} from './provider-response-mocks';
import {MissingTokenInHeader} from '../../errors/missing-token-in-header';
import {SecurityContextService} from '../../security-context.service';
import {SecurityService} from '../../security.service';
import {LoggerProvider} from '../../../logging/logger-provider';

class TestStrategy extends BaseGdbLoginStrategy {
  type: AuthStrategyType = AuthStrategyType.GDB_TOKEN;

  initialize(): Promise<boolean> {
    return Promise.resolve(false);
  }

  isAuthenticated(): boolean {
    return false;
  }

  logout(): Promise<void> {
    return Promise.resolve(undefined);
  }

  isExternal(): boolean {
    return false;
  }
}

describe('BaseGdbLoginStrategy', () => {
  let provider: TestStrategy;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    provider = new TestStrategy();
    loggerErrorSpy = jest.spyOn(LoggerProvider.logger, 'error');
  });

  describe('login', () => {
    let updateAuthenticatedUserSpy: jest.SpyInstance;
    let setAuthTokenSpy: jest.SpyInstance;
    let loginGdbTokenSpy: jest.SpyInstance;

    const loginData = {username: 'testUser', password: '1234'};

    beforeEach(() => {
      updateAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityContextService), 'updateAuthenticatedUser');
      setAuthTokenSpy = jest.spyOn(ServiceProvider.get(AuthenticationStorageService), 'setAuthToken');
      loginGdbTokenSpy = jest.spyOn(ServiceProvider.get(SecurityService), 'loginGdbToken');
    });

    it('should login, set token, update user', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/login').setResponse(ProviderResponseMocks.loginResponse).setHeaders(new Headers({authorization: 'GDB someToken'})));

      const result = await provider.login(loginData);
      expect(result).toBeTruthy();

      expect(loginGdbTokenSpy).toHaveBeenCalledWith(loginData.username, loginData.password);
      expect(setAuthTokenSpy).toHaveBeenCalledWith('GDB someToken');
      expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
    });

    it('should throw if user mapping fails', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/login').setResponse('errorLogin').setSetThrowOnJson(true));

      await expect(provider.login(loginData)).rejects.toThrow('Failed to map user from response');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Could not map user from response', expect.any(Error));
    });

    it('should not set token/user if auth header or user is missing', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/login').setResponse(ProviderResponseMocks.loginResponse));

      await expect(provider.login(loginData)).rejects.toThrow(MissingTokenInHeader);
      expect(setAuthTokenSpy).not.toHaveBeenCalled();
      expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
    });
  });
});
