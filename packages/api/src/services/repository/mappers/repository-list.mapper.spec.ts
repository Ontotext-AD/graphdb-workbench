import {RepositoryListMapper} from './repository-list.mapper';
import {Repository, RepositoryList} from '../../../models/repositories';

describe('RepositoryListMapper', () => {

  let repositoryListMapper: RepositoryListMapper;

  beforeEach(() => {
    repositoryListMapper = new RepositoryListMapper();
  });

  test('Should return an instance of RepositoryList with repositories', () => {
    const repoOneId = 'repo-one-id';
    const repoTwoId = 'repo-two-id';
    const repoThreeId = 'repo-three-id';
    const repoThreeLocation = 'http://localhost:7002';
    const rawRepositoryObjects = {
      '': [{
        id: repoOneId,
        location: ''
      }, {
        id: repoTwoId,
        location: ''
      }],
      'http://localhost:7002': [
        {
          id: repoThreeId,
          location: repoThreeLocation
        }
      ]
    };

    const repositoryList = repositoryListMapper.mapToModel(rawRepositoryObjects);

    expect(repositoryList).toBeInstanceOf(RepositoryList);
    const repositories = repositoryList.getItems();
    expect(repositories).toHaveLength(3);
    expect(repositories).toContainEqual(new Repository({id: repoOneId, location: ''} as Repository));
    expect(repositories).toContainEqual(new Repository({id: repoTwoId, location: ''} as Repository));
    expect(repositories).toContainEqual(new Repository({id: repoThreeId, location: repoThreeLocation} as Repository));
  });

  test('Should return an instance of RepositoryList without any repositories if none are passed.', () => {
    const repositoryList = repositoryListMapper.mapToModel(undefined);

    expect(repositoryList).toBeInstanceOf(RepositoryList);
    expect(repositoryList.getItems()).toHaveLength(0);
  });
});
