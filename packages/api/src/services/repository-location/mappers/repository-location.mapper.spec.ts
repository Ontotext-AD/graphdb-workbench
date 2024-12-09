import {RepositoryLocationMapper} from './repository-location.mapper';
import {RepositoryLocation} from '../../../models/repository-location';

describe('RepositoryLocationMapper', () => {

  test('Should return an instance of RepositoryLocationMapper', () => {
    const repositoryLocationMapper = new RepositoryLocationMapper();
    const repoUri = 'repo-uri';

    const repository = repositoryLocationMapper.mapToModel({uri: repoUri});

    expect(repository).toBeInstanceOf(RepositoryLocation);
    expect(repository).toEqual(new RepositoryLocation({uri: repoUri} as RepositoryLocation));
  });
});
