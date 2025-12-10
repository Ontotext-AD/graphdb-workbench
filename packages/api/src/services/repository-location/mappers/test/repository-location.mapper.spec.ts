import {RepositoryLocationMapper} from '../repository-location.mapper';
import {RepositoryLocation, RepositoryLocationResponse} from '../../../../models/repository-location';
import {RepositoryLocationMockProvider} from '../../test/repository-location-mock-provider';

describe('RepositoryLocationMapper', () => {

  test('Should return an instance of RepositoryLocationMapper', () => {
    const mapper = new RepositoryLocationMapper();
    const uri = 'repo-uri';

    const raw: RepositoryLocationResponse =
      RepositoryLocationMockProvider.provideRawRepositoryLocation(uri);

    const expected = RepositoryLocationMockProvider.provideRepositoryLocation(uri);

    const actual = mapper.mapToModel(raw);

    expect(actual).toBeInstanceOf(RepositoryLocation);
    expect(actual).toEqual(expected);
  });
});
