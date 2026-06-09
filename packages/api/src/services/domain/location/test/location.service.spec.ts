import {LocationService} from '../location.service';
import {Location} from '../../../../models/location';
import {LocationMockProvider} from './location-mock-provider';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';

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
});
