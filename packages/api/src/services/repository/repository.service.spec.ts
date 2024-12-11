import {RepositoryService} from './repository.service';
import {RepositoryRestService} from './repository-rest.service';
import {Repository, RepositoryList, RepositorySizeInfo} from '../../models/repositories';
import {ServiceProvider} from '../../providers';

jest.mock('./repository-rest.service');
jest.mock('../../providers/service/service.provider');

describe('RepositoryService', () => {
  let repositoryService: RepositoryService;
  let mockRepositoryRestService: jest.Mocked<RepositoryRestService>;

  beforeEach(() => {
    mockRepositoryRestService = new RepositoryRestService() as jest.Mocked<RepositoryRestService>;
    ServiceProvider.get = jest.fn().mockReturnValue(mockRepositoryRestService);
    repositoryService = new RepositoryService();
  });

  test('should return repositories', async () => {
    // Mock the response from RepositoryRestService.
    const rawRepository = {id: 'repo-id', title: 'repo-title', location: ''};
    const mockResponse = {'': [rawRepository]};
    mockRepositoryRestService.getRepositories.mockResolvedValue(mockResponse as unknown as Record<string, []>);
    const expectedResult = new RepositoryList([new Repository(rawRepository as Repository)]);

    // When the service is called to fetch all repositories,
    const repositories = await repositoryService.getRepositories();

    // Then I expect it to return an instance of RepositoryList,
    expect(repositories).toBeInstanceOf(RepositoryList);
    // with all repositories included.
    expect(repositories).toEqual(expectedResult);
  });

  test('should return an instance of RepositorySizeInfo', async () => {
    const rawRepositorySizeInfo = {
      inferred: 2,
      total: 3,
      explicit: 1
    };
    mockRepositoryRestService.getRepositorySizeInfo.mockResolvedValue(rawRepositorySizeInfo as unknown as RepositorySizeInfo);

    // When the service is called to fetch size info of a repository.
    const repositorySizeInfo = await repositoryService.getRepositorySizeInfo(new Repository());

    // Then I expect it to return an instance of RepositoryList,
    expect(repositorySizeInfo).toBeInstanceOf(RepositorySizeInfo);
    // with all repositories included.
    expect(repositorySizeInfo).toEqual(new RepositorySizeInfo(rawRepositorySizeInfo));
  });
});
