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

  test('isOntop should return true when sesameType is Ontop', () => {
    const repository = new Repository({
      id: 'repo-ontop',
      sesameType: 'graphdb:OntopRepository'
    });
    expect(repository.isOntop()).toBe(true);
    expect(repository.isFedx()).toBe(false);
  });

  test('isOntop should return false when sesameType is not Ontop', () => {
    const repository = new Repository({
      id: 'repo-not-ontop',
      sesameType: 'some:OtherRepository'
    });
    expect(repository.isOntop()).toBe(false);
  });

  test('isFedx should return true when sesameType is FedX', () => {
    const repository = new Repository({
      id: 'repo-fedx',
      sesameType: 'graphdb:FedXRepository'
    });
    expect(repository.isFedx()).toBe(true);
    expect(repository.isOntop()).toBe(false);
  });

  test('isFedx should return false when sesameType is not FedX', () => {
    const repository = new Repository({
      id: 'repo-not-fedx',
      sesameType: 'another:Type'
    });
    expect(repository.isFedx()).toBe(false);
  });

});
