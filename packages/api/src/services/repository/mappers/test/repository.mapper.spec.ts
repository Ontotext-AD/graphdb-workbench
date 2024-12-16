import {RepositoryMapper} from '../repository.mapper';
import {Repository} from '../../../../models/repositories';
import {RepositoryMockProvider} from '../../test/repository-mock-provider';

describe('RepositoryMapper', () => {

  let repositoryMapper = new RepositoryMapper();

  beforeEach(() => {
    repositoryMapper = new RepositoryMapper();
  });

  test('mapToModel should return an instance of Repository', () => {
    const rawRepositoryData = RepositoryMockProvider.provideRawRepository('repo-id');
    const expectedResult = RepositoryMockProvider.provideRepository('repo-id');

    const repository = repositoryMapper.mapToModel(rawRepositoryData);

    expect(repository).toBeInstanceOf(Repository);
    expect(repository).toEqual(expectedResult);
  });
});
