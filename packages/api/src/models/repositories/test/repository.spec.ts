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

  describe('local', () => {
    test('should keep the provided local value', () => {
      expect(new Repository({location: 'http://remote:7200', local: true}).local).toBe(true);
      expect(new Repository({location: '', local: false}).local).toBe(false);
    });

    test('should be true when not provided and the location is empty', () => {
      expect(new Repository({id: 'repo'}).local).toBe(true);
    });

    test('should be true when not provided and the location is not an http(s) URL', () => {
      expect(new Repository({location: 'local-location'}).local).toBe(true);
    });

    test('should be false when not provided and the location is an http URL', () => {
      expect(new Repository({location: 'http://remote:7200'}).local).toBe(false);
    });

    test('should be false when not provided and the location is an https URL', () => {
      expect(new Repository({location: 'https://remote:7200'}).local).toBe(false);
    });

    test('should be false when not provided and the location is an upper-case http(s) URL', () => {
      expect(new Repository({location: 'HTTP://remote:7200'}).local).toBe(false);
      expect(new Repository({location: 'HTTPS://remote:7200'}).local).toBe(false);
    });
  });

});
