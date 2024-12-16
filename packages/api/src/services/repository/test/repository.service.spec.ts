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
    TestUtil.mockResponse(new ResponseMock('/rest/repositories/all').setResponse(response));
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

    TestUtil.mockResponse(new ResponseMock(`/rest/repositories/${repository.id}/size?location=${repository.location}`).setResponse(rawRepositorySizeInfo));
    const expectedResult = rawRepositorySizeInfo;

    // When the service is called to fetch size info of a repository.
    const repositorySizeInfo = await repositoryService.getRepositorySizeInfo(repository);

    // Then I expect it to return an instance of RepositoryList,
    expect(repositorySizeInfo).toBeInstanceOf(RepositorySizeInfo);
    // with all repositories included.
    expect(repositorySizeInfo).toEqual(new RepositorySizeInfo(expectedResult));
  });
});
