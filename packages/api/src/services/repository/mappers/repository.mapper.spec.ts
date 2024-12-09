import {RepositoryMapper} from './repository.mapper';
import {Repository} from '../../../models/repositories';

describe('RepositoryMapper', () => {

  test('Should return an instance of Repository', () => {
    const repositoryMapper = new RepositoryMapper();
    const repoId = 'repo-id';
    const repoLocation = 'repo-location';

    const repository = repositoryMapper.mapToModel({id: repoId, location: repoLocation});

    expect(repository).toBeInstanceOf(Repository);
    expect(repository).toEqual(new Repository({id: repoId, location: repoLocation} as Repository));
  });
});
