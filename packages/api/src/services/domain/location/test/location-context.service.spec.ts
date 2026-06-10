import {LocationContextService} from '../location-context.service';
import {Location, LocationList} from '../../../../models/location';

describe('LocationContextService', () => {
  let locationContextService: LocationContextService;

  beforeEach(() => {
    locationContextService = new LocationContextService();
  });

  test('Should call the "onActiveLocationChangedCallbackFunction" when the active location changes.', () => {
    const onActiveLocationChangedCallbackFunction = jest.fn();
    const newLocation = createLocation('location-uri');

    // When I register a callback function for active location changes,
    locationContextService.onActiveLocationChanged(onActiveLocationChangedCallbackFunction);
    // and the active location is updated,
    locationContextService.updateActiveLocation(newLocation);

    // Then I expect the callback function to be called with the passed location.
    expect(onActiveLocationChangedCallbackFunction).toHaveBeenLastCalledWith(newLocation);
  });

  test('Should call the "onIsLoadingChangedCallbackFunction" when the loading state changes.', () => {
    // Given, I have mocked the onIsLoadingChangedCallbackFunction
    const onIsLoadingChangedCallbackFunction = jest.fn();
    const isLoading = true;

    // When I register a callback function for loading state changes,
    locationContextService.onIsLoadingChanged(onIsLoadingChangedCallbackFunction);
    // and the loading state is updated,
    locationContextService.updateIsLoading(isLoading);

    // Then I expect the callback function to be called with the passed loading state.
    expect(onIsLoadingChangedCallbackFunction).toHaveBeenLastCalledWith(isLoading);
  });

  test('Should not call isLoading callback, if unsubscribed', () => {
    //Given, I have mocked the onIsLoadingChangedCallbackFunction
    const onIsLoadingChangedCallbackFunction = jest.fn();
    const isLoading = true;
    const unsubscribeFunction = locationContextService.onIsLoadingChanged(onIsLoadingChangedCallbackFunction);
    // Clear the first callback call when the callback function is registered.
    onIsLoadingChangedCallbackFunction.mockClear();

    // When I unsubscribe the function from the loading state event,
    unsubscribeFunction();

    // Then I expect the callback function not to be called, when I update the context.
    locationContextService.updateIsLoading(isLoading);
    expect(onIsLoadingChangedCallbackFunction).not.toHaveBeenCalled();
  });

  describe('locations field', () => {
    test('Should call the onActiveLocationChanged callback when the active location changes.', () => {
      // GIVEN: I have a registered callback function for locations changes.
      const onLocationsChangedCallbackFunction = jest.fn();
      locationContextService.onLocationsChanged(onLocationsChangedCallbackFunction);
      const locations = new LocationList([
        createLocation('locations-uri-one'),
        createLocation('locations-uri-two'),
      ]);

      // WHEN: I update the locations field with a new array of locations,
      locationContextService.updateLocations(locations);
      // THEN: I expect the callback function to be called with the passed array of locations.
      expect(onLocationsChangedCallbackFunction).toHaveBeenLastCalledWith(locations);
    });

    test('should not call the onLocationsChanged callback when callback is unsubscribed', () => {
      // GIVEN: I have a registered callback function for locations changes.
      const onLocationsChangedCallbackFunction = jest.fn();
      const unsubscribe = locationContextService.onLocationsChanged(onLocationsChangedCallbackFunction);
      // Clear the first callback call when the callback function is registered.
      onLocationsChangedCallbackFunction.mockClear();
      const locations = new LocationList([
        createLocation('locations-uri-one'),
        createLocation('locations-uri-two'),
      ]);

      // WHEN: I unsubscribe the callback function.
      unsubscribe();
      // AND: I update the locations field with a new array of locations,
      locationContextService.updateLocations(locations);
      // THEN: I expect the callback function to not have been called.
      expect(onLocationsChangedCallbackFunction).not.toHaveBeenCalled();
    });
  });
});

function createLocation(uri: string) {
  return new Location({uri} as Location);
}
