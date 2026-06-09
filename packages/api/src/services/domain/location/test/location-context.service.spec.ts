import {LocationContextService} from '../location-context.service';
import {Location} from '../../../../models/location';

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
});

function createLocation(uri: string) {
  return new Location({uri} as Location);
}
