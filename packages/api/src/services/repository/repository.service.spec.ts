import {RepositoryService} from './repository.service';
import {RepositoryList} from '../../models/repositories';
import {TestUtil} from '../utils/test/test-util';
import {RepositoryMockProvider} from './test/repository-mock-provider';

describe('RepositoryService', () => {
  let repositoryService: RepositoryService;

  beforeEach(() => {
    repositoryService = new RepositoryService();
  });

  test('getRepositories should return repositories', async () => {
    const response = {'': [RepositoryMockProvider.provideRawRepository('repo-id')]};
    TestUtil.mockResponse(response);
    const expectedResult = {items: [RepositoryMockProvider.provideRepository('repo-id')]};

    // When the service is called to fetch all repositories,
    const repositories = await repositoryService.getRepositories();

    // Then I expect it to return an instance of RepositoryList,
    expect(repositories).toBeInstanceOf(RepositoryList);
    // with all repositories included.
    expect(repositories).toEqual(expectedResult);
  });

});
