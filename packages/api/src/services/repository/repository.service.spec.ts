import {RepositoryService} from './repository.service';
import {RepositoryRestService} from './repository-rest.service';
import {ServiceProvider} from '../../service.provider';
import {Repository, RepositoryList} from '../../models/repositories';

jest.mock('./repository-rest.service');
jest.mock('../../service.provider');

describe('RepositoryService', () => {
  let repositoryService: RepositoryService;
  let mockRepositoryRestService: jest.Mocked<RepositoryRestService>;

  beforeEach(() => {
    mockRepositoryRestService = new RepositoryRestService() as jest.Mocked<RepositoryRestService>;
    ServiceProvider.get = jest.fn().mockReturnValue(mockRepositoryRestService);
    repositoryService = new RepositoryService();
  });

  describe('getRepositories', () => {
    test('should return repositories', async () => {
      // Mock the response from RepositoryRestService.
      const rawRepository = {id: 'repo-id', title: 'repo-title', location: ''};
      const mockResponse = {'': [rawRepository]};
      mockRepositoryRestService.getRepositories.mockResolvedValue(mockResponse);
      const expectedResult = new RepositoryList([new Repository(rawRepository as Repository)]);

      // When the service is called to fetch all repositories,
      const repositories = await repositoryService.getRepositories();

      // Then I expect it to return an instance of RepositoryList,
      expect(repositories).toBeInstanceOf(RepositoryList);
      // with all repositories included.
      expect(repositories).toEqual(expectedResult);
    });
  });

});
