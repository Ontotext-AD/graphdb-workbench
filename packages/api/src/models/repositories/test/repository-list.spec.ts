import {Repository} from '../repository';
import {RepositoryList} from '../repository-list';

describe('RepositoryList', () => {
  let repositories: Repository[];
  let repositoryList: RepositoryList;

  beforeEach(() => {
    repositories = [
      {
        id: '1', location: 'A',
        title: '',
        type: undefined,
        sesameType: undefined,
        uri: '',
        externalUrl: '',
        state: undefined,
        local: undefined,
        readable: undefined,
        writable: undefined,
        unsupported: undefined,
        copy: function (): Repository {
          throw new Error('Function not implemented.');
        }
      },
      {
        id: '2', location: 'B',
        title: '',
        type: undefined,
        sesameType: undefined,
        uri: '',
        externalUrl: '',
        state: undefined,
        local: undefined,
        readable: undefined,
        writable: undefined,
        unsupported: undefined,
        copy: function (): Repository {
          throw new Error('Function not implemented.');
        }
      },
      {
        id: '3', location: 'A',
        title: '',
        type: undefined,
        sesameType: undefined,
        uri: '',
        externalUrl: '',
        state: undefined,
        local: undefined,
        readable: undefined,
        writable: undefined,
        unsupported: undefined,
        copy: function (): Repository {
          throw new Error('Function not implemented.');
        }
      },
    ];
    repositoryList = new RepositoryList(repositories);
  });

  test('should find a repository by ID and location', () => {
    const repository = repositoryList.findRepository('1', 'A');
    expect(repository?.id).toBe('1');
  });

  test('should return undefined if repository is not found', () => {
    const repository = repositoryList.findRepository('4', 'C');
    expect(repository).toBeUndefined();
  });

  test('should sort repositories by location and ID', () => {
    repositoryList.sortByLocationAndId();
    expect(repositoryList.getItems()).toEqual([
      expect.objectContaining({ id: '1', location: 'A' }),
      expect.objectContaining({ id: '3', location: 'A' }),
      expect.objectContaining({ id: '2', location: 'B' }),
    ]);
  });

  test('should filter repositories by excluding specified IDs', () => {
    const filteredRepositories = repositoryList.filterByIds(['1', '3']);
    expect(filteredRepositories).toEqual([
      expect.objectContaining({ id: '2', location: 'B' }),
    ]);
  });
});
