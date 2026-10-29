import {getRepositoryIdWithLocation, isSameRepository, RepositoryReference} from '../repository-reference';

describe('RepositoryReference', () => {
  test('getRepositoryIdWithLocation should return only the repository ID when the location is missing', () => {
    const repositoryId = 'repo123';
    // WHEN: I call the function with location undefined
    let repositoryIdWithLocation = getRepositoryIdWithLocation({id: repositoryId} as unknown as RepositoryReference);
    // THEN: I expect the result to be only the repository id
    expect(repositoryIdWithLocation).toEqual(repositoryId);

    // WHEN: I call the function with an empty location.
    repositoryIdWithLocation = getRepositoryIdWithLocation({id: repositoryId, location: ''});
    // THEN: I expect the result to be only the repository id
    expect(repositoryIdWithLocation).toEqual(repositoryId);
  });

  test('getRepositoryIdWithLocation should return the repository ID and location', () => {
    const repositoryId = 'repo123';
    const location = 'repo-location-123';
    // WHEN: I call the function
    const repositoryIdWithLocation = getRepositoryIdWithLocation({id: repositoryId, location});
    // THEN: I expect the result to be only the repository id
    expect(repositoryIdWithLocation).toEqual(`${repositoryId}@${location}`);
  });

  test('isSameRepository should return true for references with the same ID and location', () => {
    // GIVEN: two references to the same repository
    const repository = {id: 'repo123', location: 'repo-location-123'};
    const otherRepository = {id: 'repo123', location: 'repo-location-123'};
    // WHEN: I compare them
    const isSame = isSameRepository(repository, otherRepository);
    // THEN: I expect them to be the same repository
    expect(isSame).toBe(true);
  });

  test('isSameRepository should return false when the ID or the location differs', () => {
    const repository = {id: 'repo123', location: 'repo-location-123'};
    // WHEN: I compare with a reference with another ID
    // THEN: I expect them to be different repositories
    expect(isSameRepository(repository, {id: 'repo456', location: 'repo-location-123'})).toBe(false);

    // WHEN: I compare with a reference with the same ID in another location
    // THEN: I expect them to be different repositories
    expect(isSameRepository(repository, {id: 'repo123', location: 'repo-location-456'})).toBe(false);
  });

  test('isSameRepository should handle missing references', () => {
    // WHEN: I compare two missing references
    // THEN: I expect them to be the same
    expect(isSameRepository(undefined, undefined)).toBe(true);

    // WHEN: I compare a reference with a missing one
    // THEN: I expect them to be different
    expect(isSameRepository({id: 'repo123', location: ''}, undefined)).toBe(false);
  });
});
