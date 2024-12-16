import {RepositoryLocationService} from '../repository-location.service';
import {RepositoryLocation} from '../../../models/repository-location';
import {RepositoryLocationMockProvider} from './repository-location-mock-provider';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';

describe('RepositoryLocationService', () => {
  let repositoryLocationService: RepositoryLocationService;

  beforeEach(() => {
    repositoryLocationService = new RepositoryLocationService();
  });

  test('getActiveRepositoryLocation should return the active repository location', async () => {
    const rawRepository = RepositoryLocationMockProvider.provideRawRepositoryLocation('repo-location-uri');
    TestUtil.mockResponse(new ResponseMock('/rest/locations/active').setResponse(rawRepository));
    const expectedResult = RepositoryLocationMockProvider.provideRepositoryLocation('repo-location-uri');

    // When the service is called to fetch the active repository location,
    const activeRepositoryLocation = await repositoryLocationService.getActiveRepositoryLocation();

    // Then the result should be an instance of RepositoryLocation,
    expect(activeRepositoryLocation).toBeInstanceOf(RepositoryLocation);
    // and it should match the expected repository location.
    expect(activeRepositoryLocation).toEqual(expectedResult);
  });
});
