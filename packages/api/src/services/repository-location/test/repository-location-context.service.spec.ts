import {RepositoryLocationContextService} from '../repository-location-context.service';
import {RepositoryLocation} from '../../../models/repository-location';

describe('RepositoryLocationContextService', () => {
  let repositoryLocationContextService: RepositoryLocationContextService;

  beforeEach(() => {
    repositoryLocationContextService = new RepositoryLocationContextService();
  });

  test('Should call the "onActiveLocationChangedCallbackFunction" when the active location changes.', () => {
    const onActiveLocationChangedCallbackFunction = jest.fn();
    const newRepositoryLocation = createRepositoryLocation('repo-location-uri');

    // When I register a callback function for active location changes,
    repositoryLocationContextService.onActiveLocationChanged(onActiveLocationChangedCallbackFunction);
    // and the active repository location is updated,
    repositoryLocationContextService.updateActiveRepositoryLocation(newRepositoryLocation);

    // Then I expect the callback function to be called with the passed repository location.
    expect(onActiveLocationChangedCallbackFunction).toHaveBeenLastCalledWith(newRepositoryLocation);
  });

  test('Should call the "onIsLoadingChangedCallbackFunction" when the loading state changes.', () => {
    // Given, I have mocked the onIsLoadingChangedCallbackFunction
    const onIsLoadingChangedCallbackFunction = jest.fn();
    const isLoading = true;

    // When I register a callback function for loading state changes,
    repositoryLocationContextService.onIsLoadingChanged(onIsLoadingChangedCallbackFunction);
    // and the loading state is updated,
    repositoryLocationContextService.updateIsLoading(isLoading);

    // Then I expect the callback function to be called with the passed loading state.
    expect(onIsLoadingChangedCallbackFunction).toHaveBeenLastCalledWith(isLoading);
  });

  test('Should not call isLoading callback, if unsubscribed', () => {
    //Given, I have mocked the onIsLoadingChangedCallbackFunction
    const onIsLoadingChangedCallbackFunction = jest.fn();
    const isLoading = true;
    const unsubscribeFunction = repositoryLocationContextService.onIsLoadingChanged(onIsLoadingChangedCallbackFunction);
    // Clear the first callback call when the callback function is registered.
    onIsLoadingChangedCallbackFunction.mockClear();

    // When I unsubscribe the function from the loading state event,
    unsubscribeFunction();

    // Then I expect the callback function not to be called, when I update the context.
    repositoryLocationContextService.updateIsLoading(isLoading);
    expect(onIsLoadingChangedCallbackFunction).not.toHaveBeenCalled();
  });

  function createRepositoryLocation(uri: string) {
    return new RepositoryLocation({uri} as RepositoryLocation);
  }
});
