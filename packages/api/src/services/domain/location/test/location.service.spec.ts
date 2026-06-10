import {LocationService} from '../location.service';
import {Location, LocationList} from '../../../../models/location';
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

  test('deleteLocation should call the API endpoint to delete a location', async () => {
    const uri = 'repo-delete-location-uri';
    TestUtil.mockResponse(new ResponseMock(`rest/locations?uri=${uri}`));

    // WHEN: I call deleteLocation with a location uri
    await locationService.deleteLocation(uri);

    // THEN: I expect a POST request to be made to the correct endpoint with the location ur as query parameters
    const request = TestUtil.getRequest(`rest/locations?uri=${uri}`);
    expect(request).toBeDefined();
    expect(request?.method).toBe('DELETE');

  });

  describe('getLocations', () => {
    test('getLocations should return a list of locations', async () => {
      // GIVEN: The locations endpoint returns a list of locations.
      const responseLocations = [
        LocationMockProvider.provideRawLocation('first-location-uri'),
        LocationMockProvider.provideRawLocation('second-location-uri')
      ];
      TestUtil.mockResponse(new ResponseMock('rest/locations').setResponse(responseLocations));

      const expectedResults = new LocationList([
        LocationMockProvider.provideLocation('first-location-uri'),
        LocationMockProvider.provideLocation('second-location-uri')
      ]);

      // WHEN: I call the getLocations method.
      const locationList = await locationService.getLocations();
      // THEN: I expect a GET request to be sent to the locations endpoint.
      const request = TestUtil.getRequest('rest/locations');
      expect(request).toBeDefined();
      expect(request?.method).toBe('GET');
      // AND: I receive the list of available locations.
      expect(locationList).toBeInstanceOf(LocationList);
      expect(locationList).toEqual(expectedResults);
    });

    test('getLocations should accept an AbortSignal and complete without error', async () => {
      // GIVEN: The locations endpoint returns a list of locations.
      const responseLocations = [
        LocationMockProvider.provideRawLocation('first-location-uri'),
        LocationMockProvider.provideRawLocation('second-location-uri')
      ];
      TestUtil.mockResponse(new ResponseMock('rest/locations').setResponse(responseLocations));

      const expectedResults = new LocationList([
        LocationMockProvider.provideLocation('first-location-uri'),
        LocationMockProvider.provideLocation('second-location-uri')
      ]);

      // WHEN: I call the getLocations method with abort signal.
      const locationList = await locationService.getLocations(new AbortController().signal);
      // THEN: I expect a GET request to be sent to the locations endpoint.
      const request = TestUtil.getRequest('rest/locations');
      expect(request).toBeDefined();
      expect(request?.method).toBe('GET');
      // AND: I receive the list of available locations.
      expect(locationList).toBeInstanceOf(LocationList);
      expect(locationList).toEqual(expectedResults);
    });

    test('getLocations should return an empty list when the result is undefined', async () => {
      // GIVEN: The locations endpoint returns no data.
      TestUtil.mockResponse(new ResponseMock('rest/locations').setResponse(undefined));

      // WHEN: I call the getLocations method.
      const locationList = await locationService.getLocations();
      // THEN: I receive an empty location list
      expect(locationList).toBeInstanceOf(LocationList);
      expect(locationList.getItems().length).toEqual(0);
    });

    test('getLocations should return an empty list when the result is not an array', async () => {
      // GIVEN: The locations endpoint returns an invalid response.
      TestUtil.mockResponse(new ResponseMock('rest/locations').setResponse({}));

      // WHEN: I call the getLocations method.
      const locationList = await locationService.getLocations();
      // THEN: I receive an empty location list
      expect(locationList).toBeInstanceOf(LocationList);
      expect(locationList.getItems().length).toEqual(0);
    });
  });
});
