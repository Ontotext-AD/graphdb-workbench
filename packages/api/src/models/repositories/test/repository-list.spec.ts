import {Repository} from '../repository';
import {RepositoryList} from '../repository-list';

describe('RepositoryList', () => {
  let repositories: Repository[];
  let repositoryList: RepositoryList;

  beforeEach(() => {
    repositories = [
      new Repository({
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
      }),
      new Repository({
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
      }),
      new Repository({
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
      }),
    ];
    repositoryList = new RepositoryList(repositories);
  });

  describe('findRepository', () => {
    test('should find a repository by ID and location', () => {
      const repository = repositoryList.findRepository('1', 'A');
      expect(repository?.id).toBe('1');
      expect(repository?.location).toBe('A');
    });

    test('should return undefined if repository is not found', () => {
      const repository = repositoryList.findRepository('4', 'C');
      expect(repository).toBeUndefined();
    });

    test('should return undefined if ID matches but location does not match', () => {
      const repository = repositoryList.findRepository('1', 'B');
      expect(repository).toBeUndefined();
    });

    test('should return undefined if location matches but ID does not match', () => {
      const repository = repositoryList.findRepository('4', 'A');
      expect(repository).toBeUndefined();
    });

    test('should find a repository by ID when ignoringLocation is true, even if location differs', () => {
      const repository = repositoryList.findRepository('1', 'B', true);
      expect(repository?.id).toBe('1');
      expect(repository?.location).toBe('A');
    });

    test('should find first matching repository by ID when ignoringLocation is true and multiple repositories have same ID', () => {
      // Add another repository with same ID but different location
      const duplicateIdRepo = new Repository({
        id: '1', location: 'C',
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
      });
      repositoryList = new RepositoryList([...repositories, duplicateIdRepo]);

      const repository = repositoryList.findRepository('1', 'Z', true);
      expect(repository?.id).toBe('1');
      // First match
      expect(repository?.location).toBe('A');
    });

    test('should return undefined when ignoringLocation is true but ID does not exist', () => {
      const repository = repositoryList.findRepository('999', 'A', true);
      expect(repository).toBeUndefined();
    });

    test('should respect exact location match when ignoringLocation is false (default)', () => {
      const repository = repositoryList.findRepository('1', 'B', false);
      expect(repository).toBeUndefined();
    });

    test('should use ignoringLocation as false by default', () => {
      const repository = repositoryList.findRepository('1', 'B');
      expect(repository).toBeUndefined();
    });

    test('should find repository with both ID and location match when ignoringLocation is false', () => {
      const repository = repositoryList.findRepository('2', 'B', false);
      expect(repository?.id).toBe('2');
      expect(repository?.location).toBe('B');
    });

    test('should find repository by ID regardless of location when ignoringLocation is true', () => {
      const repository = repositoryList.findRepository('3', 'X', true);
      expect(repository?.id).toBe('3');
      expect(repository?.location).toBe('A');
    });

    test('should return undefined when searching in empty list', () => {
      const emptyList = new RepositoryList([]);
      const repository = emptyList.findRepository('1', 'A');
      expect(repository).toBeUndefined();
    });

    test('should return undefined when searching in empty list with ignoringLocation true', () => {
      const emptyList = new RepositoryList([]);
      const repository = emptyList.findRepository('1', 'A', true);
      expect(repository).toBeUndefined();
    });
  });

  test('should sort repositories by location and ID', () => {
    repositoryList.sortByLocationAndId();
    expect(repositoryList.getItems()).toEqual([
      expect.objectContaining({id: '1', location: 'A'}),
      expect.objectContaining({id: '3', location: 'A'}),
      expect.objectContaining({id: '2', location: 'B'}),
    ]);
  });

  test('should filter repositories by excluding specified IDs', () => {
    const repositoryToFilter = new Repository({
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
    });
    const filteredRepositories = repositoryList.filterByRepository([repositoryToFilter]);
    expect(filteredRepositories).toHaveLength(2);
    expect(filteredRepositories).not.toContain(repositoryToFilter);
    expect(filteredRepositories).toEqual([
      expect.objectContaining({id: '1', location: 'A'}),
      expect.objectContaining({id: '3', location: 'A'}),
    ]);
  });
});
