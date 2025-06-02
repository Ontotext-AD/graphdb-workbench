import {Repository} from '../repository';
import {RepositoryType} from '../repository-type';
import {RepositoryState} from '../repository-state';

describe('Repository', () => {
  
  test('toRepositoryReference should return a valid RepositoryReference', () => {
    const repository = new Repository({
      id: 'repo123',
      location: 'http://localhost:8080',
      title: '',
      type: RepositoryType.GRAPH_DB,
      sesameType: undefined,
      uri: '',
      externalUrl: '',
      state: RepositoryState.RUNNING,
      local: true,
      readable: undefined,
      writable: undefined,
      unsupported: undefined,
    });
    
    expect(repository.toRepositoryReference()).toEqual({
      id: 'repo123',
      location: 'http://localhost:8080'
    });
  });
});
