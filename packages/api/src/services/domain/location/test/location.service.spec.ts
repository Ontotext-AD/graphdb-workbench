import {LocationService} from '../location.service';
import {Location} from '../../../../models/location';
import {LocationMockProvider} from './location-mock-provider';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {RepositoryReference} from '../../../../models/repositories';

describe('LocationService', () => {
  let locationService: LocationService;

  beforeEach(() => {
    locationService = new LocationService();
  });

  test('getActiveLocation should return the active location', async () => {
    const rawLocation = LocationMockProvider.provideRawLocation('location-uri');
    TestUtil.mockResponse(new ResponseMock('rest/locations/active').setResponse(rawLocation));
    const expectedResult = LocationMockProvider.provideLocation('location-uri');

    // When the service is called to fetch the active location,
    const activeLocation = await locationService.getActiveLocation();

    // Then the result should be an instance of Location,
    expect(activeLocation).toBeInstanceOf(Location);
    // and it should match the expected location.
    expect(activeLocation).toEqual(expectedResult);
  });

  test('setDefaultRepository should call the API endpoint to set the default repository for the active location', async () => {
    const repository: RepositoryReference = {
      id: 'restart-repo-id',
      location: 'local'
    };
    TestUtil.mockResponse(new ResponseMock('rest/locations/active/default-repository'));

    // WHEN: I call setDefaultRepository with a repository reference
    await locationService.setDefaultRepository(repository);

    // THEN: I expect a POST request to be made to the correct endpoint and repository id as body.
    const request = TestUtil.getRequest('rest/locations/active/default-repository');
    expect(request).toBeDefined();
    expect(request?.method).toBe('POST');
    expect(request?.body).toEqual(`{\"defaultRepository\":\"${repository.id}\"}`);

  });
});
