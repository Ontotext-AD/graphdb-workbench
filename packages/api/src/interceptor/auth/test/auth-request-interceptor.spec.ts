import {AuthRequestInterceptor} from '../auth-request-interceptor';
import {ServiceProvider} from '../../../providers/service/service.provider';
import {AuthenticationStorageService} from '../../../services/security/authentication-storage.service';
import {RepositoryStorageService} from '../../../services/repository/repository-storage.service';
import {StorageData} from '../../../models/storage';

describe('AuthHttpInterceptor', () => {
  let authHttpInterceptor: AuthRequestInterceptor;
  const authStorage = ServiceProvider.get(AuthenticationStorageService);
  const repositoryStorage = ServiceProvider.get(RepositoryStorageService);

  beforeEach(() => {
    authHttpInterceptor = new AuthRequestInterceptor();
  });

  test('Should add Authorization header when auth token is available', async () => {
    // Given, I have a mock auth token
    const mockAuthToken = 'mock-auth-token';
    const mockRequest = {
      headers: {},
      url: 'http://example.com/api/endpoint',
      method: 'GET',
      body: {}
    };

    // And I have mocked the auth storage service to return the mock auth token
    jest.spyOn(authStorage, 'getAuthToken').mockImplementation(() => {
      return new StorageData(mockAuthToken);
    });

    // When I preprocess the request
    const result = await authHttpInterceptor.process(mockRequest);

    // Then, the authorization header should be added to the request
    expect(result.headers['X-Requested-With']).toEqual('XMLHttpRequest');
    expect(result.headers['Authorization']).toEqual(mockAuthToken);
    expect(result.headers['X-GraphDB-Repository']).toBeUndefined();
    expect(result.headers['X-GraphDB-Repository-Location']).toBeUndefined();
  });

  test('Should add X-GraphDB-Repository header when repository context is available', async () => {
    const mockRequest = {
      headers: {},
      url: 'http://example.com/api/endpoint',
      method: 'GET',
      body: {}
    };
    // Given, I have a mock selected repository ID
    const mockRepositoryId = '1';
    // And I have mocked the repository storage service to return the mock selected repository ID
    jest.spyOn(repositoryStorage, 'get').mockImplementation((param) => {
      const value = param === 'selectedRepositoryId' ? mockRepositoryId : null;
      return new StorageData(value);
    });

    // When I preprocess the request
    const result = await authHttpInterceptor.process(mockRequest);

    // Then, the X-GraphDB-Repository header should be added to the request
    expect(result.headers['X-Requested-With']).toEqual('XMLHttpRequest');
    expect(result.headers['Authorization']).toBeUndefined();
    expect(result.headers['X-GraphDB-Repository']).toEqual(mockRepositoryId);
    expect(result.headers['X-GraphDB-Repository-Location']).toBeUndefined();
  });

  test('Should add X-GraphDB-Repository-Location header when repository context is available', async () => {
    const mockRequest = {
      headers: {},
      url: 'http://example.com/api/endpoint',
      method: 'GET',
      body: {}
    };
    // Given, I have a mock selected repository location
    const mockRepositoryLocation = 'repo-location-uri';
    // And I have mocked the repository storage service to return the mock selected repository location
    jest.spyOn(repositoryStorage, 'get').mockImplementation((param) => {
      const value = param === 'repositoryLocation' ? mockRepositoryLocation : null;
      return new StorageData(value);
    });

    // When I preprocess the request
    const result = await authHttpInterceptor.process(mockRequest);

    // Then, the X-GraphDB-Repository-Location header should be added to the request
    expect(result.headers['X-Requested-With']).toEqual('XMLHttpRequest');
    expect(result.headers['Authorization']).toBeUndefined();
    expect(result.headers['X-GraphDB-Repository']).toBeUndefined();
    expect(result.headers['X-GraphDB-Repository-Location']).toEqual(mockRepositoryLocation);
  });
});
