import {RepositoryListMapper} from '../repository-list.mapper';
import {RepositoryList} from '../../../../models/repositories';
import {RepositoryMockProvider} from '../../test/repository-mock-provider';

describe('RepositoryListMapper', () => {

  let repositoryListMapper: RepositoryListMapper;

  beforeEach(() => {
    repositoryListMapper = new RepositoryListMapper();
  });

  test('mapToModel should return an instance of RepositoryList with repositories', () => {
    const repoOneId = 'repo-one-id';
    const repoTwoId = 'repo-two-id';
    const repoThreeId = 'repo-three-id';
    const rawRepositoryObjects = {
      '': [RepositoryMockProvider.provideRawRepository(repoOneId), RepositoryMockProvider.provideRawRepository(repoTwoId)],
      'http://localhost:7002': [RepositoryMockProvider.provideRawRepository(repoThreeId, 'http://localhost:7002')]
    };
    const expectedResult = {items: [RepositoryMockProvider.provideRepository(repoOneId), RepositoryMockProvider.provideRepository(repoTwoId), RepositoryMockProvider.provideRepository(repoThreeId, 'http://localhost:7002')]};

    const repositoryList = repositoryListMapper.mapToModel(rawRepositoryObjects);

    expect(repositoryList).toBeInstanceOf(RepositoryList);
    expect(repositoryList).toEqual(expectedResult);
  });

  test('mapToModel should return an instance of RepositoryList without any repositories if none are passed.', () => {
    const repositoryList = repositoryListMapper.mapToModel(undefined);

    expect(repositoryList).toBeInstanceOf(RepositoryList);
    expect(repositoryList.getItems()).toHaveLength(0);
  });
});
