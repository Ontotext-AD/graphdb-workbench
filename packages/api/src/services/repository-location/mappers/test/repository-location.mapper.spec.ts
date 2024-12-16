import {RepositoryLocationMapper} from '../repository-location.mapper';
import {RepositoryLocation} from '../../../../models/repository-location';
import {RepositoryLocationMockProvider} from '../../test/repository-location-mock-provider';

describe('RepositoryLocationMapper', () => {

  test('Should return an instance of RepositoryLocationMapper', () => {
    const repositoryLocationMapper = new RepositoryLocationMapper();
    const repoUri = 'repo-uri';

    const repository = repositoryLocationMapper.mapToModel(RepositoryLocationMockProvider.provideRawRepositoryLocation(repoUri));

    expect(repository).toBeInstanceOf(RepositoryLocation);
    expect(repository).toEqual(RepositoryLocationMockProvider.provideRawRepositoryLocation(repoUri));
  });
});
