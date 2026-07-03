import {getRepositoryIdWithLocation, RepositoryReference} from '../repository-reference';

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
});
