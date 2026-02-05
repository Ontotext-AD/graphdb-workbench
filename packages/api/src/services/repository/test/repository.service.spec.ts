import {RepositoryService} from '../repository.service';
import {Repository, RepositoryList, RepositorySizeInfo} from '../../../models/repositories';
import {TestUtil} from '../../utils/test/test-util';
import {RepositoryMockProvider} from './repository-mock-provider';
import {ResponseMock} from '../../http/test/response-mock';

describe('RepositoryService', () => {
  let repositoryService: RepositoryService;

  beforeEach(() => {
    repositoryService = new RepositoryService();
  });

  test('getRepositories should return repositories', async () => {
    const response = {'': [RepositoryMockProvider.provideRawRepository('repo-id')]};
    TestUtil.mockResponse(new ResponseMock('rest/repositories/all').setResponse(response));
    const expectedResult = {items: [RepositoryMockProvider.provideRepository('repo-id')]};

    // When the service is called to fetch all repositories,
    const repositories = await repositoryService.getRepositories();

    // Then I expect it to return an instance of RepositoryList,
    expect(repositories).toBeInstanceOf(RepositoryList);
    // with all repositories included.
    expect(repositories).toEqual(expectedResult);
  });

  test('getRepositorySizeInfo should return an instance of RepositorySizeInfo', async () => {
    const rawRepositorySizeInfo = {
      inferred: 2,
      total: 3,
      explicit: 1
    };
    const repository: Repository = RepositoryMockProvider.provideRepository('repo-id', 'repo-location');

    TestUtil.mockResponse(new ResponseMock(`rest/repositories/${repository.id}/size?location=${repository.location}`).setResponse(rawRepositorySizeInfo));
    const expectedResult = rawRepositorySizeInfo;

    // When the service is called to fetch size info of a repository.
    const repositorySizeInfo = await repositoryService.getRepositorySizeInfo(repository);

    // Then I expect it to return an instance of RepositoryList,
    expect(repositorySizeInfo).toBeInstanceOf(RepositorySizeInfo);
    // with all repositories included.
    expect(repositorySizeInfo).toEqual(new RepositorySizeInfo(expectedResult));
  });

  describe('parseRepositoryUrl', () => {
    test('should parse a valid HTTP repository URL correctly', () => {
      const url = 'http://localhost:7200/repositories/my-repo';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: 'http://localhost:7200',
        id: 'my-repo'
      });
    });

    test('should parse a valid HTTPS repository URL correctly', () => {
      const url = 'https://example.com/repositories/test-repo';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: 'https://example.com',
        id: 'test-repo'
      });
    });

    test('should parse a repository URL with port number', () => {
      const url = 'http://localhost:7200/repositories/repo-123';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: 'http://localhost:7200',
        id: 'repo-123'
      });
    });

    test('should parse a repository URL with domain and path', () => {
      const url = 'https://graphdb.example.com/repositories/production-repo';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: 'https://graphdb.example.com',
        id: 'production-repo'
      });
    });

    test('should handle repository ID with special characters', () => {
      const url = 'http://localhost:7200/repositories/my-repo_123';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: 'http://localhost:7200',
        id: 'my-repo_123'
      });
    });

    test('should return empty location and id for null URL', () => {
      const url = null as never;

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: ''
      });
    });

    test('should return empty location and id for undefined URL', () => {
      const url = undefined as never;

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: ''
      });
    });

    test('should return empty location and id for empty string URL', () => {
      const url = '';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: ''
      });
    });

    test('should return empty location and URL as id for invalid URL format', () => {
      const url = 'invalid-url-format';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: 'invalid-url-format'
      });
    });

    test('should return empty location and id for URL without repositories path', () => {
      const url = 'http://localhost:7200/some-other-path/my-repo';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: ''
      });
    });

    test('should return empty location and URL as id for just a repository ID', () => {
      const url = 'my-repo';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: 'my-repo'
      });
    });

    test('should return empty location and id for URL with trailing content after repository ID', () => {
      const url = 'http://localhost:7200/repositories/my-repo/statements';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: ''
      });
    });

    test('should return empty location and id for URL with trailing slash after repository ID', () => {
      const url = 'http://localhost:7200/repositories/my-repo/';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: ''
      });
    });

    test('should return empty location and id for URL with multiple trailing segments', () => {
      const url = 'http://localhost:7200/repositories/my-repo/contexts/statements';

      const result = repositoryService.parseRepositoryUrl(url);

      expect(result).toEqual({
        location: '',
        id: ''
      });
    });
  });

  describe('getRepositoryIdentifier', () => {
    test('should return full URL identifier for repository with location', () => {
      const repository = new Repository({
        id: 'my-repo',
        location: 'http://localhost:7200'
      });

      const result = repositoryService.getRepositoryIdentifier(repository);

      expect(result).toBe('http://localhost:7200/repositories/my-repo');
    });

    test('should return full URL identifier for repository with HTTPS location', () => {
      const repository = new Repository({
        id: 'test-repo',
        location: 'https://example.com:8080'
      });

      const result = repositoryService.getRepositoryIdentifier(repository);

      expect(result).toBe('https://example.com:8080/repositories/test-repo');
    });

    test('should return just the repository ID when location is empty', () => {
      const repository = new Repository({
        id: 'local-repo',
        location: ''
      });

      const result = repositoryService.getRepositoryIdentifier(repository);

      expect(result).toBe('local-repo');
    });

    test('should return just the repository ID when location is not provided', () => {
      const repository = new Repository({
        id: 'standalone-repo'
      });

      const result = repositoryService.getRepositoryIdentifier(repository);

      expect(result).toBe('standalone-repo');
    });

    test('should handle repository ID with special characters', () => {
      const repository = new Repository({
        id: 'my-repo_123',
        location: 'http://localhost:7200'
      });

      const result = repositoryService.getRepositoryIdentifier(repository);

      expect(result).toBe('http://localhost:7200/repositories/my-repo_123');
    });

    test('should handle repository with domain location', () => {
      const repository = new Repository({
        id: 'production-db',
        location: 'https://graphdb.company.com'
      });

      const result = repositoryService.getRepositoryIdentifier(repository);

      expect(result).toBe('https://graphdb.company.com/repositories/production-db');
    });
  });
});
