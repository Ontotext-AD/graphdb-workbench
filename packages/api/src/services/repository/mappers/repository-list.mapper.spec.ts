import {RepositoryListMapper} from './repository-list.mapper';
import {RepositoryList} from '../../../models/repositories';
import {RepositoryMockProvider} from '../test/repository-mock-provider';

describe('RepositoryListMapper', () => {

  let repositoryListMapper: RepositoryListMapper;

  beforeEach(() => {
    repositoryListMapper = new RepositoryListMapper();
  });

  test('mapToModel should return an instance of RepositoryList with repositories', () => {
    const repoOne = RepositoryMockProvider.provideRawRepository('repo-one-id');
    const repoTwo = RepositoryMockProvider.provideRawRepository('repo-two-id');
    const repoThree = RepositoryMockProvider.provideRawRepository('repo-three-id', 'http://localhost:7002');
    const rawRepositoryObjects = {
      '': [repoOne, repoTwo],
      'http://localhost:7002': [repoThree]
    };
    const expectedResult = {items: [RepositoryMockProvider.provideRepository('repo-one-id'), RepositoryMockProvider.provideRepository('repo-two-id'), RepositoryMockProvider.provideRepository('repo-three-id', 'http://localhost:7002')]};

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
